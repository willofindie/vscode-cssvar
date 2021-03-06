import { readFile, existsSync, stat } from "fs";
import postcss, { Declaration, Node, Rule } from "postcss";
import { promisify } from "util";
import {
  CACHE,
  CSS_VAR_REGEX,
  Config,
  CSSVarRecord,
  SUPPORTED_CSS_RULE_TYPES,
} from "./constants";

import { CSSVarDeclarations } from "./main";
import { getColor, getCSSDeclarationArray } from "./utils";

const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

const cssParseAsync = (file: string) => {
  return postcss([]).process(file, {
    from: undefined,
  });
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
  return !!node.type.match(type);
};

/**
 * Get CSS Variable Declarations Array
 * from PostCSS AST of a CSS file.
 */
export function getVariableDeclarations(
  config: Config,
  node: Node,
  theme?: string | null
): CSSVarDeclarations[] {
  let declarations: CSSVarDeclarations[] = [];
  if (
    isNodeType<Declaration>(node, SUPPORTED_CSS_RULE_TYPES[1]) &&
    CSS_VAR_REGEX.test(node.prop)
  ) {
    declarations.push({
      property: node.prop,
      value: node.value,
      theme: theme || "",
    });
  } else if (isNodeType<Rule>(node, SUPPORTED_CSS_RULE_TYPES[0])) {
    const [theme] = config.themes.filter(theme => node.selector.match(theme));
    if (!config.excludeThemedVariables || !theme) {
      for (const _node of node.nodes) {
        const decls = getVariableDeclarations(config, _node, theme);
        declarations = declarations.concat(decls);
      }
    }
  }
  return declarations;
}

/**
 * Parse a CSS file, and cache generated AST
 * into CSSVarDeclarations[].
 */
const parseFile = async function (path: string, config: Config) {
  const file = await readFileAsync(path, { encoding: "utf8" });
  const css = await cssParseAsync(file);
  return {
    [path]: css.root.nodes.reduce<CSSVarDeclarations[]>(
      (declarations, node: Node) => {
        const dec = getVariableDeclarations(config, node);
        declarations = declarations.concat(dec);
        return declarations;
      },
      []
    ),
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
    // Get Color for each, and modify the cssVar Record.
    const vars = getCSSDeclarationArray(cssVars);
    vars.forEach(cssVar => {
      try {
        const color = getColor(cssVar.value, vars);
        if (color.success) {
          cssVar.color = color.color;
        }
      } catch (e) {
        // console.log("Color Parse Error: ", cssVar.value, e.message);
      }
    });
  }

  CACHE.cssVars = cssVars;
  return [CACHE.cssVars, errorPaths];
};
