import { Location, Position, Range, Uri, window, workspace } from "vscode";
import { readFile, existsSync, stat } from "fs";
import postcss, {
  AtRule,
  Declaration,
  Node,
  ProcessOptions,
  Rule,
} from "postcss";
import { promisify } from "util";
import {
  CACHE,
  Config,
  CSSVarRecord,
  SUPPORTED_CSS_RULE_TYPES,
  CacheType,
  POSTCSS_SYNTAX_MODULES,
  CssExtensions,
} from "./constants";
import { extname, resolve } from "path";

import { CSSVarDeclarations } from "./main";
import { getVariableType, populateValue } from "./utils";

const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

const cssParseAsync = (file: string, ext: CssExtensions) => {
  const rootPaths =
    workspace.workspaceFolders?.map(folder => folder.uri.path) || [];

  const plugins = CACHE.config.postcssPlugins
    .map(plugin => {
      try {
        return require(require.resolve(plugin, { paths: rootPaths }));
      } catch (e: any) {
        window.showErrorMessage(
          `Cannot resolve postcss plugin ${plugin}: ${e.toString()}`
        );
      }
      return null;
    })
    .filter(Boolean);

  /* Postcss Syntax needs to be applied only for files of that type */
  const syntaxModuleName = CACHE.config.postcssSyntax.find(moduleName => {
    return moduleName === POSTCSS_SYNTAX_MODULES[ext];
  });

  const options: ProcessOptions = {
    from: undefined,
    syntax: undefined,
  };
  if (syntaxModuleName) {
    try {
      options.syntax = require(require.resolve(syntaxModuleName, {
        paths: rootPaths,
      }));
    } catch (e: any) {
      window.showErrorMessage(
        `Cannot resolve postcss syntax module ${syntaxModuleName}: ${e.toString()}`
      );
    }
  }

  /* Parse a single file, with a syntax if provided */
  return postcss(plugins).process(file, options);
};

/**
 * This is an impure function, to update CACHE
 * when any file is deleted.
 */
const updateCacheOnFileDelete = () => {
  const deletedPaths = Object.keys(CACHE.cssVars).filter(
    path => !existsSync(path)
  );
  if (deletedPaths.length > 0) {
    deletedPaths.forEach(path => {
      delete CACHE.cssVars[path];
      delete CACHE.fileMetas[path];
    });
  }
};

export const isNodeType = <T extends Node>(
  node: Node,
  type: string
): node is T => {
  return node.type === type;
};

type ParsingOptions = {
  path?: string;
  theme?: string | null;
};

/**
 * Get CSS Variable Declarations Array
 * from PostCSS AST of a CSS file.
 */
export function getVariableDeclarations(
  config: Config,
  node: Node,
  options: ParsingOptions = {}
): CSSVarDeclarations[] {
  let declarations: CSSVarDeclarations[] = [];
  const { path = "" } = options;

  if (isNodeType<Declaration>(node, SUPPORTED_CSS_RULE_TYPES[1])) {
    const type = getVariableType(node.prop);
    if (type) {
      let location: Location | undefined = undefined;
      try {
        const uri = Uri.file(path);
        let position: Position | Range = new Position(0, 0);
        if (node.source?.start && node.source?.end) {
          position = new Range(
            new Position(
              node.source.start.line - 1,
              node.source.start.column - 1
            ),
            new Position(node.source.end.line - 1, node.source.end.column - 1)
          );
        }
        location = new Location(uri, position);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to find the Location: ", e);
      }

      declarations.push({
        type,
        property: node.prop,
        value: node.value,
        location,
        theme: options.theme || "",
      });
    }
  }

  if (isNodeType<Rule>(node, SUPPORTED_CSS_RULE_TYPES[0])) {
    const [theme] = config.themes.filter(theme => node.selector.match(theme));
    if (!config.excludeThemedVariables || !theme) {
      for (const _node of node.nodes) {
        const decls = getVariableDeclarations(config, _node, {
          ...options,
          theme,
        });
        declarations = declarations.concat(decls);
      }
    }
  }

  return declarations;
}

/**
 * Parse a CSS file, and cache generated AST
 * into CSSVarDeclarations[].
 *
 * This Function locally mutates Parsing Options, since Extrnsions like
 * sass contains custom variables, which is not parsed by Syntax Plugins
 */
const parseFile = async function (
  path: string,
  config: Config
): Promise<Record<string, CSSVarDeclarations[]>> {
  /* Parse Current File */
  const file = await readFileAsync(path, { encoding: "utf8" });
  const css = await cssParseAsync(
    file,
    extname(path).replace(".", "") as CssExtensions
  );

  /* Find imported paths from CSS file */
  const resolvedImportPaths = css.root.nodes.reduce((resolvedPaths, node) => {
    if (
      isNodeType<AtRule>(node, SUPPORTED_CSS_RULE_TYPES[2]) &&
      node.name === "import"
    ) {
      const match = node.params.match(/url\(['"](.*?)['"]\)/);
      if (match) {
        const toPath = match[1];
        const resolvedPath = resolve(path, "..", toPath);
        if (!(<string[]>config.files).includes(resolvedPath)) {
          resolvedPaths.push(resolvedPath);
        }
      }
    }
    return resolvedPaths;
  }, [] as string[]);

  /* Parse Imported files which are not part of the config list */
  let importDeclarations: Record<string, CSSVarDeclarations[]> = {};
  for await (const resolvedPath of resolvedImportPaths) {
    const declarations = await parseFile(resolvedPath, config);
    importDeclarations = {
      ...importDeclarations,
      ...declarations,
    };
  }

  return {
    [path]: css.root.nodes.reduce<CSSVarDeclarations[]>(
      (declarations, node: Node) => {
        const dec = getVariableDeclarations(config, node, { path });
        declarations = declarations.concat(dec);
        return declarations;
      },
      []
    ),
    ...importDeclarations,
  };
};

/**
 * Parses a plain CSS file (even SCSS files, if they are pure CSS)
 * and retrives all the CSS variables present in all the selected
 * files. Parsing is done only once when plugin activates,
 * and everytime any file gets modified.
 */
export const parseFiles = async function (
  config: Config
): Promise<[CSSVarRecord, string[]]> {
  updateCacheOnFileDelete();

  let cssVars: CSSVarRecord = CACHE.cssVars;
  const isModified =
    Object.keys(CACHE.fileMetas).length !== config.files.length;
  const errorPaths: string[] = [];
  const filesArray = <string[]>config.files;

  for (const path of filesArray) {
    const cachedFileMeta = CACHE.fileMetas[path];
    const meta = await statAsync(path);
    const lastModified = meta.mtimeMs;
    if (
      isModified ||
      !cachedFileMeta ||
      lastModified !== cachedFileMeta.lastModified
    ) {
      // Read and Parse File, only when file has modified
      let newVars = { [path]: [] as CSSVarDeclarations[] };
      try {
        newVars = await parseFile(path, config);
      } catch (e) {
        errorPaths.push(path);
      }
      cssVars = {
        ...cssVars,
        ...newVars,
      };
    }
    if (!cachedFileMeta) {
      CACHE.fileMetas[path] = {
        path,
        lastModified,
      };
    } else {
      CACHE.fileMetas[path].lastModified = lastModified;
    }
  }

  if (CACHE.cssVars !== cssVars) {
    try {
      const [vars, cssVarsMap] = populateValue(cssVars);
      CACHE.cssVarDefinitionsMap = vars.reduce((defs, cssVar) => {
        if (!cssVar.location) {
          return defs;
        }

        const key = cssVar.property;
        if (key in defs) {
          defs[key].push(cssVar.location);
        } else {
          defs[key] = [cssVar.location];
        }
        return defs;
      }, {} as CacheType["cssVarDefinitionsMap"]);
      CACHE.cssVarsMap = cssVarsMap;
    } catch (e) {
      window.showErrorMessage(`Populating Variable Values: ${e}`);
    }
  }

  CACHE.cssVars = cssVars;
  return [CACHE.cssVars, errorPaths];
};
