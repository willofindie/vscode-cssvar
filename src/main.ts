import { CompletionItem, CompletionItemKind, workspace } from "vscode";
import { resolve } from "path";
import { readFile } from "fs";
import { promisify } from "util";
import postcss, { Rule, Node, Declaration } from "postcss";
import { NoWorkspaceError } from "./errors";
import { Config, CSS3Colors, DEFAULT_CONFIG, EXTENSION_NAME } from "./defaults";
import memoize from "memoize-one";
import { lighten } from "polished";

//#region Utilities
const readFileAsync = promisify(readFile);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isObjectProperty = <T>(obj: T, key: any): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const shallowCompare = (obj1: any, obj2: any) => {
  if (obj1 == null || obj2 == null) {
    return obj1 !== obj2;
  }
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === "string" || obj1 instanceof String) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "number" || obj1 instanceof Number) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "boolean" || obj1 instanceof Boolean) {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const isEqual = obj1.length === obj2.length;
    if (isEqual) {
      return obj1.every((item, index) => item === obj2[index]);
    } else {
      return isEqual;
    }
  }
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      key => isObjectProperty(obj2, key) && obj1[key] === obj2[key]
    )
  );
};

const cache: {
  cssVars: CSSVarDeclarations[];
} = {
  cssVars: [],
};

//#endregion Utilities

/**
 * Sets up the Plugin
 *
 * @throws {@link NoWorkspaceError}
 */
export function setup(): { config: Config } {
  if (!workspace.workspaceFolders) {
    throw new NoWorkspaceError("No Workspace found.");
  }
  const workspaceFolder = workspace.workspaceFolders || [];
  const resourcePath = workspaceFolder[0]?.uri.fsPath;
  const _config = workspace.getConfiguration(EXTENSION_NAME);
  const files = _config["files"] || DEFAULT_CONFIG.files;
  const config: Config = {
    ...DEFAULT_CONFIG,
    ..._config,
    files: files.map((path: string) => resolve(resourcePath, path)),
    workspaceFolder: resourcePath,
  };

  return {
    config,
  };
}

const SUPPORTED_TYPES = ["rule", "decl"];
const CSS_VAR_REGEX = /^[\s\t]*--/;
interface CSSVarDeclarations {
  property: string;
  value: string;
}

const cssParseAsync = (file: string) => {
  return postcss([]).process(file, {
    from: undefined,
  });
};

const compareCSSVars = (
  prev: CSSVarDeclarations[],
  next: CSSVarDeclarations[]
) => {
  return (
    prev.length === next.length &&
    prev.every((item, index) => shallowCompare(item, next[index]))
  );
};

const isRule = (node: Node): node is Rule => {
  return !!node.type.match(SUPPORTED_TYPES[0]);
};
const isDeclaration = (node: Node): node is Declaration => {
  return !!node.type.match(SUPPORTED_TYPES[1]);
};

function getVariableDeclarations(node: Node): CSSVarDeclarations[] {
  let declarations: CSSVarDeclarations[] = [];
  if (isDeclaration(node) && CSS_VAR_REGEX.test(node.prop)) {
    declarations.push({
      property: node.prop,
      value: node.value,
    });
  } else if (isRule(node)) {
    for (const _node of node.nodes) {
      const decls = getVariableDeclarations(_node);
      declarations = declarations.concat(decls);
    }
  }
  return declarations;
}

export const parseFiles = async function (config: Config) {
  let cssVars: CSSVarDeclarations[] = [];
  for (const path of config.files) {
    const file = await readFileAsync(path, { encoding: "utf8" });
    const css = await cssParseAsync(file);
    cssVars = cssVars.concat(
      css.root.nodes.reduce<CSSVarDeclarations[]>(
        (declarations, node: Node) => {
          declarations = declarations.concat(getVariableDeclarations(node));
          return declarations;
        },
        []
      ) || []
    );
  }
  if (!compareCSSVars(cache.cssVars, cssVars)) {
    cache.cssVars = cssVars;
  }
  return cache.cssVars;
};

function getColor(
  value: string,
  cssVars?: CSSVarDeclarations[]
): {
  success: boolean;
  color: string;
} {
  if (cssVars && /^var/.test(value)) {
    const propertyName = value.match(/^var\((--[\w-]*)\)/);
    if (propertyName) {
      const cssVar = cssVars.find(
        cssVar => cssVar.property === propertyName[1]
      );
      return getColor(cssVar?.value || "");
    }
  } else {
    if (
      /^#|^rgba?|^hsla?|^transparent$/.test(value) ||
      CSS3Colors.includes(value.toLowerCase())
    ) {
      return {
        success: true,
        color: lighten(0, value),
      };
    }
  }
  return {
    success: false,
    color: "",
  };
}

export const createCompletionItems = memoize(
  (
    cssVars: CSSVarDeclarations[],
    predicate?: (cssVar: CSSVarDeclarations) => boolean
  ) =>
    cssVars.reduce<CompletionItem[]>((items, cssVar) => {
      if (!predicate || predicate(cssVar)) {
        const color = getColor(cssVar.value, cssVars);
        const KIND = color.success
          ? CompletionItemKind.Color
          : CompletionItemKind.Variable;
        const item = new CompletionItem(cssVar.property, KIND);
        item.detail = cssVar.value;
        item.documentation = color.color;
        item.insertText = `var(${cssVar.property});`;
        items.push(item);
      }
      return items;
    }, []),
  (newArgs, lastArgs) => newArgs[0] === lastArgs[0]
);
