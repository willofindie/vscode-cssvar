import { CompletionItem, CompletionItemKind, workspace } from "vscode";
import { resolve } from "path";
import { readFile } from "fs";
import { promisify } from "util";
import postcss, { Node } from "postcss";
import { NoWorkspaceError } from "./errors";
import { Config, DEFAULT_CONFIG, EXTENSION_NAME } from "./constants";
import memoize from "memoize-one";
import { getColor, getVariableDeclarations } from "./utils";

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
  const config: Record<keyof Config, ValueOf<Config>> = {} as Config;
  for (const key in DEFAULT_CONFIG) {
    if (isObjectProperty(DEFAULT_CONFIG, key)) {
      const value = _config.get<ValueOf<Config>>(key) || DEFAULT_CONFIG[key];
      switch (key) {
        case "files":
          config[key] = (<string[]>value).map((path: string) =>
            resolve(resourcePath, path)
          );
          break;
        case "workspaceFolder":
          config[key] = resourcePath;
          break;
        default:
          config[key] = value;
          break;
      }
    }
  }

  return {
    config: config as Config,
  };
}

export interface CSSVarDeclarations {
  property: string;
  value: string;
  theme: string;
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

/**
 * Parses a plain CSS file (even SCSS files, if they are pure CSS)
 * and retrives all the CSS variables present in all the selected
 * files
 */
export const parseFiles = async function (config: Config) {
  let cssVars: CSSVarDeclarations[] = [];
  for (const path of config.files) {
    const file = await readFileAsync(path, { encoding: "utf8" });
    const css = await cssParseAsync(file);
    cssVars = cssVars.concat(
      css.root.nodes.reduce<CSSVarDeclarations[]>(
        (declarations, node: Node) => {
          declarations = declarations.concat(
            getVariableDeclarations(config, node)
          );
          return declarations;
        },
        []
      )
    );
  }
  if (!compareCSSVars(cache.cssVars, cssVars)) {
    cache.cssVars = cssVars;
  }
  return cache.cssVars;
};

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
        const extra = cssVar.theme !== "" ? `\n\nTheme: [${cssVar.theme}]` : "";
        const propertyName = `${cssVar.property}`;
        const item = new CompletionItem(propertyName, KIND);
        item.detail = `Value: ${cssVar.value}${extra}`;
        item.documentation = color.color;
        item.insertText = `var(${cssVar.property});`;
        items.push(item);
      }
      return items;
    }, []),
  (newArgs, lastArgs) => newArgs[0] === lastArgs[0]
);
