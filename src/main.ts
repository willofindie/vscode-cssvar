import { CompletionItem, CompletionItemKind, workspace } from "vscode";
import { resolve } from "path";
import { readFile, stat, existsSync } from "fs";
import { promisify } from "util";
import postcss, { Node } from "postcss";
import fastGlob from "fast-glob";
import { NoWorkspaceError } from "./errors";
import {
  Config,
  DEFAULT_CONFIG,
  EXTENSION_NAME,
  mapShortToFullExtension,
  SupportedExtensionNames,
} from "./constants";
import memoize from "memoize-one";
import { getColor, getVariableDeclarations, isObjectProperty } from "./utils";

//#region Utilities
const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

type CSSVarRecord = { [path: string]: CSSVarDeclarations[] };
const cache: {
  cssVars: CSSVarRecord;
  fileMetas: {
    [path: string]: {
      path: string;
      lastModified: number;
    };
  };
} = {
  cssVars: {},
  fileMetas: {},
};

//#endregion Utilities

/**
 * Sets up the Plugin
 *
 * @throws {@link NoWorkspaceError}
 */
export async function setup(): Promise<{ config: Config }> {
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
        case "files": {
          const entries = await fastGlob(<string[]>value, {
            cwd: resourcePath,
          });
          config[key] = entries.map((path: string) =>
            resolve(resourcePath, path)
          );
          break;
        }
        case "workspaceFolder":
          config[key] = resourcePath;
          break;
        case "extensions":
          config[key] = (<SupportedExtensionNames[]>value).map(ext =>
            mapShortToFullExtension(ext)
          );
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

/**
 * Parses a plain CSS file (even SCSS files, if they are pure CSS)
 * and retrives all the CSS variables present in all the selected
 * files. Parsing is done only once when plugin activates,
 * and everytime any file gets modified.
 */
export const parseFiles = async function (
  config: Config
): Promise<CSSVarRecord> {
  //#region Remove Delete File Path variables
  const deletedPath = Object.keys(cache.cssVars).filter(
    path => !existsSync(path)
  );
  if (deletedPath.length > 0) {
    deletedPath.forEach(path => {
      delete cache.cssVars[path];
      delete cache.fileMetas[path];
    });
  }
  //#endregion
  let cssVars: CSSVarRecord = cache.cssVars;
  const isModified =
    Object.keys(cache.fileMetas).length !== config.files.length;
  for (const path of config.files) {
    const cachedFileMeta = cache.fileMetas[path];
    const meta = await statAsync(path);
    const lastModified = meta.mtimeMs;
    if (
      isModified ||
      !cachedFileMeta ||
      lastModified !== cachedFileMeta.lastModified
    ) {
      // Read and Parse File, only when file has modified
      const file = await readFileAsync(path, { encoding: "utf8" });
      const css = await cssParseAsync(file);
      cssVars = {
        ...cssVars,
        [path]: css.root.nodes.reduce<CSSVarDeclarations[]>(
          (declarations, node: Node) => {
            declarations = declarations.concat(
              getVariableDeclarations(config, node)
            );
            return declarations;
          },
          []
        ),
      };
    }
    if (!cachedFileMeta) {
      cache.fileMetas[path] = {
        path,
        lastModified,
      };
    } else {
      cache.fileMetas[path].lastModified = lastModified;
    }
  }

  cache.cssVars = cssVars;
  return cache.cssVars;
};

export const createCompletionItems = memoize(
  (
    cssVars: CSSVarRecord,
    predicate?: (cssVar: CSSVarDeclarations) => boolean
  ) => {
    const vars = Object.keys(cssVars).reduce(
      (acc, key) => acc.concat(cssVars[key]),
      [] as CSSVarDeclarations[]
    );
    return vars.reduce<CompletionItem[]>((items, cssVar) => {
      if (!predicate || predicate(cssVar)) {
        const color = getColor(cssVar.value, vars);
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
    }, []);
  },
  (newArgs, lastArgs) => newArgs[0] === lastArgs[0]
);
