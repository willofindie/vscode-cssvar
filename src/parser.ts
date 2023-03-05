import { Location, Position, Range, Uri, window, workspace } from "vscode";
import { readFile, existsSync, stat } from "fs";
import postcss, {
  AtRule,
  ChildNode,
  Declaration,
  Node,
  ProcessOptions,
  Rule,
} from "postcss";
import { getParser } from "./third-party";
import preProcessor, { JS_BLOCK } from "./pre-processors";
import { promisify } from "util";
import {
  CACHE,
  Config,
  CSSVarRecord,
  SUPPORTED_CSS_RULE_TYPES,
  CacheType,
  CssExtensions,
  SUPPORTED_IMPORT_NAMES,
  JsExtensions,
  SUPPORTED_EVALUATING_ATRULES,
  CSSVarLocation,
} from "./constants";
import { dirname, extname, resolve } from "path";

import { CSSVarDeclarations } from "./main";
import {
  getCSSErrorMsg,
  getRemoteCSSVarLocation,
  getVariableType,
  populateValue,
  postcssPluginResolver,
} from "./utils";
import { LOGGER } from "./logger";
import { fetchAndCacheAsset } from "./remote-paths";

const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

const removeListingDuplcates = (vars: CSSVarDeclarations[]) => {
  const uniques = new Map();
  vars.forEach(decl => {
    uniques.set(decl.property, decl);
  });
  // Map iteration happens in insertion order.
  return Array.from(uniques.values());
};

const cssParseAsync = async (
  content: string,
  ext: CssExtensions | JsExtensions,
  rootPath: string
) => {
  const rootPaths =
    workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
  const rootPathsOrUndefined = rootPaths.length === 0 ? undefined : rootPaths;

  const pluginPromises: Promise<any>[] = [];

  /**
   * FIXME(phoenisx): Improve the logic to support multiple node_modules
   * present in multi-root projects, each having different root folder path
   * and config file paths.
   */
  CACHE.config[rootPath].postcssPlugins.forEach(plugin => {
    pluginPromises.push(
      postcssPluginResolver(plugin[0], {
        lookupPaths: rootPathsOrUndefined,
        cwd: CACHE.activeRootPath,
        ...plugin[1],
      })
    );
  });

  /* Postcss Syntax needs to be applied only for files of that type */
  const syntaxModuleName = CACHE.config[rootPath].postcssSyntax[ext];

  const options: ProcessOptions = {
    from: undefined,
    parser: syntaxModuleName ? undefined : await getParser(ext),
    syntax: undefined,
  };

  if (syntaxModuleName) {
    try {
      options.syntax = require(require.resolve(syntaxModuleName, {
        paths: rootPathsOrUndefined,
      }));
    } catch (e: any) {
      window.showErrorMessage(
        `Cannot resolve postcss syntax module ${syntaxModuleName}. Please add postcss@8 as project's dependency.`
      );
      LOGGER.error(`Failed to load postcss syntax module: ${rootPaths}`, e);
    }
  }

  /* Parse a single file, with a syntax if provided */
  const [processedContentResult, ...pluginImportResults] =
    await Promise.allSettled([preProcessor(content, ext), ...pluginPromises]);
  const plugins = pluginImportResults
    .filter(result => result.status === "fulfilled" && !!result.value)
    .map(result => (result as PromiseFulfilledResult<any>).value);

  const preProcessedContent =
    processedContentResult.status === "fulfilled"
      ? processedContentResult.value
      : content;
  return postcss(plugins).process(preProcessedContent, options);
};

/**
 * This is an impure function, to update CACHE
 * when any file is deleted.
 */
const updateCacheOnFileDelete = (rootPath: string) => {
  const deletedPaths = Object.keys(CACHE.cssVars[rootPath] || {}).filter(
    path => !existsSync(path)
  );
  if (deletedPaths.length > 0) {
    deletedPaths.forEach(path => {
      if (CACHE.cssVars[rootPath]) {
        delete CACHE.cssVars[rootPath][path];
      }
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
 *
 * Since we are using safe-parser, we should manually remove
 * nodes with improper prop name or values in it.
 */
export function getVariableDeclarations(
  config: Config,
  node: Node,
  options: ParsingOptions = {}
): CSSVarDeclarations[] {
  let declarations: CSSVarDeclarations[] = [];
  const { path = "" } = options;

  if (isNodeType<Declaration>(node, SUPPORTED_CSS_RULE_TYPES[1])) {
    const prop = node.prop.trim();
    const value = node.value && node.value.trim();
    const type = getVariableType(prop);
    if (type && !!value && value !== JS_BLOCK) {
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
        LOGGER.error("Failed to find the Location: ", e);
      }

      declarations.push({
        type,
        property: prop,
        value: value,
        real: value,
        location,
        theme: options.theme || "",
      });
    }
  }

  if (isNodeType<Rule>(node, SUPPORTED_CSS_RULE_TYPES[0])) {
    // For proper theming, following filter condition should be improved
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

  // Parse nested rules inside media queries
  if (
    isNodeType<AtRule>(node, SUPPORTED_CSS_RULE_TYPES[2]) &&
    SUPPORTED_EVALUATING_ATRULES.has(node.name)
  ) {
    for (const _node of node.nodes) {
      const decls = getVariableDeclarations(config, _node, options);
      declarations = declarations.concat(decls);
    }
  }

  return declarations;
}

/**
 * Parse a CSS file, and cache generated AST
 * into CSSVarDeclarations[].
 *
 * Recursively parse a file, when it contains `imports`
 *
 * Cache such file paths to a set to watch them change.
 */
const parseFile = async function (
  cssvarLocation: CSSVarLocation,
  config: Config,
  rootPath: string
): Promise<Record<string, CSSVarDeclarations[]>> {
  let content = "";
  let extension = extname(cssvarLocation.local);
  const allLocalFiles = config.files.map(file => file.local);

  if (cssvarLocation.isRemote) {
    extension = ".css";
    await fetchAndCacheAsset(cssvarLocation.remote);
  }

  content = await readFileAsync(cssvarLocation.local, { encoding: "utf8" });
  CACHE.filesToWatch[rootPath].add(cssvarLocation.local);
  const css = await cssParseAsync(
    content,
    extension.replace(".", "") as CssExtensions | JsExtensions,
    rootPath
  );

  /* Find imported paths from CSS file */
  const resolvedImportPaths = (<ChildNode[]>css.root.nodes).reduce(
    (resolvedPaths, node) => {
      if (
        isNodeType<AtRule>(node, SUPPORTED_CSS_RULE_TYPES[2]) &&
        SUPPORTED_IMPORT_NAMES.has(node.name)
      ) {
        const match = node.params.match(
          /(['"](.*?)['"])|(url\(['"]?(.*?)['"]?\))/
        );
        if (match) {
          let toPath = match[2] || match[4] || "";
          let acceptedFile: CSSVarLocation;
          if (toPath.startsWith("http")) {
            acceptedFile = getRemoteCSSVarLocation(toPath);
          } else {
            const importFileExtension = extname(toPath);
            if (!importFileExtension) {
              toPath += extension; // Add Parent's extension
            }
            const parentDir = dirname(toPath);
            if (parentDir === "." && !toPath.startsWith(".")) {
              // Relative current dir URLs might or might not have `./`;
              toPath = "./" + toPath;
            }
            const filename = toPath.replace(parentDir, "").substring(1);

            // In Some CSS extensions like Sass, we can have imports without a `_` prefix
            // like `@use 'filename'` for `_filename.scss`
            const acceptedFiles = [toPath, `${parentDir}/_${filename}`];
            acceptedFile = acceptedFiles.reduce((acceptedFile, file) => {
              const resolvedPath = resolve(cssvarLocation.local, "..", file);
              if (existsSync(resolvedPath)) {
                acceptedFile = {
                  local: resolvedPath,
                  remote: "",
                  isRemote: false,
                };
              }
              return acceptedFile;
            }, {} as CSSVarLocation);
          }
          if (acceptedFile && !allLocalFiles.includes(acceptedFile.local)) {
            if (Object.keys(acceptedFile).length !== 0) {
              resolvedPaths.push(acceptedFile);
            }
          }
        }
      }
      return resolvedPaths;
    },
    [] as CSSVarLocation[]
  );

  /* Parse Imported files which are not part of the config list */
  let importDeclarations: Record<string, CSSVarDeclarations[]> = {};
  for await (const resolvedPath of resolvedImportPaths) {
    const declarations = await parseFile(resolvedPath, config, rootPath);
    importDeclarations = {
      ...importDeclarations,
      ...declarations,
    };
  }

  return {
    [cssvarLocation.local]: (<ChildNode[]>css.root.nodes).reduce<
      CSSVarDeclarations[]
    >((declarations, node: Node) => {
      const dec = getVariableDeclarations(config, node, {
        path: cssvarLocation.local,
      });
      declarations = declarations.concat(dec);
      return declarations;
    }, []),
    ...importDeclarations,
  };
};

const parseFilesForSingleFolder = async function (
  configMap: {
    [rootPath: string]: Config;
  },
  rootPath: string
): Promise<string[]> {
  updateCacheOnFileDelete(rootPath);

  const config = configMap[rootPath];
  let cssVars: CSSVarRecord = CACHE.cssVars[rootPath] || {};
  const errorPaths: string[] = [];
  const filesArray =
    CACHE.filesToWatch[rootPath].size > 0
      ? CACHE.filesToWatch[rootPath]
      : config.files;

  for (const path of filesArray) {
    // Path can be local or remote asset paths;
    const cssvarLocation: CSSVarLocation =
      typeof path === "string"
        ? {
            local: path,
            remote: "",
            isRemote: false,
          }
        : path;

    const cachedFileMeta = CACHE.fileMetas[cssvarLocation.local];
    const executeParsing = async (location: CSSVarLocation) => {
      // Read and Parse File, only when file has modified
      let newVars = { [location.local]: [] as CSSVarDeclarations[] };
      try {
        // Pass the actual `path` here which can be a url as well and not
        // the `filepath` which points to the tmp/filepath for URLs and `path`
        // for local files.
        newVars = await parseFile(location, config, rootPath);
      } catch (e) {
        errorPaths.push(location.local);
        LOGGER.warn(
          `Failed to Parse file (${location.local}): `,
          " :: what :: ",
          getCSSErrorMsg(location.remote || location.local, e as any)
        );
      }
      return {
        ...cssVars,
        ...newVars,
      };
    };

    let lastModified = 0;
    if (existsSync(cssvarLocation.local)) {
      const meta = await statAsync(cssvarLocation.local);
      lastModified = meta.mtimeMs;
      if (!cachedFileMeta || lastModified !== cachedFileMeta.lastModified) {
        cssVars = await executeParsing(cssvarLocation);
      }
    } else {
      // Remote files should always be parsed and cached
      cssVars = await executeParsing(cssvarLocation);
    }

    if (cssvarLocation.isRemote) {
      // Once the file is parsed, the local temp file would already be generated
      // We need to get it's modified time, so that in subsequent calls, CSS fetched
      // from remote URLs are not parsed again.
      const meta = await statAsync(cssvarLocation.local);
      lastModified = meta.mtimeMs;
    }

    if (!cachedFileMeta) {
      CACHE.fileMetas[cssvarLocation.local] = {
        path: cssvarLocation.local,
        lastModified,
      };
    } else {
      CACHE.fileMetas[cssvarLocation.local].lastModified = lastModified;
    }
  }

  const dedupedCSSVars = cssVars;
  if (CACHE.cssVars[rootPath] !== cssVars) {
    try {
      const [vars, cssVarsMap] = await populateValue(cssVars);
      CACHE.cssVarCount[rootPath] = vars.length;
      CACHE.cssVarDefinitionsMap[rootPath] = vars.reduce((defs, cssVar) => {
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
      }, {} as CacheType["cssVarDefinitionsMap"][string]);
      CACHE.cssVarsMap[rootPath] = cssVarsMap;
    } catch (e) {
      window.showErrorMessage(`Populating Variable Values: ${e}`);
    }

    // For now we will remove duplicates per file only
    // Later we can improve this and put the logic behind a `dedupe` config
    // which will `true` by default to remove duplicates across files in a folder.
    for (const filePath in cssVars) {
      if (
        Object.prototype.hasOwnProperty.call(cssVars, filePath) &&
        (!(CACHE.cssVars && CACHE.cssVars[rootPath]) ||
          cssVars[filePath] !== CACHE.cssVars[rootPath][filePath])
      ) {
        dedupedCSSVars[filePath] = removeListingDuplcates(cssVars[filePath]);
      }
    }
  }

  CACHE.cssVars[rootPath] = cssVars;

  return errorPaths;
};

/**
 * Parses a plain CSS file (even SCSS files, if they are pure CSS)
 * and retrives all the CSS variables present in all the selected
 * files. Parsing is done only once when plugin activates,
 * and everytime any file gets modified.
 */
export const parseFiles = async function (
  configMap: {
    [rootPath: string]: Config;
  },
  options: {
    parseAll?: boolean;
  } = { parseAll: false }
): Promise<[CSSVarRecord, string[]]> {
  let errorPaths: string[] = [];
  if (options.parseAll) {
    const folders = workspace.workspaceFolders || [];
    const promises: Promise<string[]>[] = [];
    for (const folder of folders) {
      const rootPath = folder.uri.fsPath;
      if (!CACHE.filesToWatch[rootPath]) {
        CACHE.filesToWatch[rootPath] = new Set();
      }
      promises.push(parseFilesForSingleFolder(configMap, rootPath));
    }

    const allPromiseSettled = await Promise.allSettled(promises);
    errorPaths = allPromiseSettled.reduce((errorPaths, settled) => {
      if (settled.status === "fulfilled") {
        return [...settled.value, ...errorPaths];
      }
      return errorPaths;
    }, [] as string[]);
  } else {
    errorPaths = await parseFilesForSingleFolder(
      configMap,
      CACHE.activeRootPath
    );
  }

  return [CACHE.cssVars[CACHE.activeRootPath], errorPaths];
};
