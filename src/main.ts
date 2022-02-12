import {
  CompletionItem,
  CompletionItemKind,
  Location,
  workspace,
} from "vscode";
import { resolve } from "path";
import fastGlob from "fast-glob";
import { NoWorkspaceError } from "./errors";
import {
  CACHE,
  Config,
  CSSVarRecord,
  DEFAULT_CONFIG,
  EXTENSION_NAME,
  mapShortToFullExtension,
  SUFFIX,
  SupportedExtensionNames,
  SupportedLanguageIds,
} from "./constants";
import {
  getCSSDeclarationArray,
  isCSSInJS,
  isObjectProperty,
  Region,
} from "./utils";
import { disableDefaultSort } from "./unstable";

/**
 * Sets up the Plugin
 *
 * TODO(shub): Cache config, to use it in places, where initial
 *  configuration is required.
 *
 * @throws {@link NoWorkspaceError}
 */
export async function setup(): Promise<{ config: Config }> {
  if (!workspace.workspaceFolders) {
    throw new NoWorkspaceError("No Workspace found.");
  }
  const workspaceFolder = workspace.workspaceFolders || [];
  const isMultiRoot = workspace.workspaceFolders.length > 1;
  const resourcePath = workspaceFolder[0]?.uri.fsPath;
  const _config = workspace.getConfiguration(EXTENSION_NAME);
  if (
    isMultiRoot &&
    (!_config.get("files") || Array.isArray(_config.get("files")))
  ) {
    throw new NoWorkspaceError(
      "Provide a map object for cssvar.files property in Multi Root Workspaces"
    );
  }
  const config: Record<keyof Config, ValueOf<Config>> = {} as Config;
  for (const key in DEFAULT_CONFIG) {
    if (isObjectProperty(DEFAULT_CONFIG, key)) {
      switch (key) {
        case "files": {
          const value =
            _config.get<Config[typeof key]>(key) || DEFAULT_CONFIG[key];
          if (isMultiRoot) {
            config[key] = [];
            for (const workspaceName of Object.keys(value)) {
              const wFolder = workspace.workspaceFolders.find(w => {
                return new RegExp(workspaceName).test(w.name);
              });
              if (wFolder) {
                const _resourcePath = wFolder.uri.fsPath;
                const globs = (<Record<string, string[]>>value)[workspaceName];
                const entries = await fastGlob(globs, {
                  cwd: _resourcePath,
                });
                config[key] = (<string[]>config[key]).concat(
                  entries.map((path: string) => resolve(_resourcePath, path))
                );
              }
            }
          } else {
            const entries = await fastGlob(<string[]>value, {
              cwd: resourcePath,
            });
            config[key] = entries.map((path: string) =>
              resolve(resourcePath, path)
            );
          }
          break;
        }
        case "extensions": {
          const value =
            _config.get<Config[typeof key]>(key) || DEFAULT_CONFIG[key];
          config[key] = value.map(ext => {
            const _ext = ext.startsWith(".")
              ? (ext.substr(1) as SupportedExtensionNames)
              : ext;
            return mapShortToFullExtension(_ext);
          });
          break;
        }
        default: {
          const value =
            _config.get<Config[typeof key]>(key) || DEFAULT_CONFIG[key];
          config[key] = value;
          break;
        }
      }
    }
  }

  CACHE.config = config as Config;

  return {
    config: CACHE.config,
  };
}

export interface CSSVarDeclarations {
  property: string;
  value: string;
  location?: Location;
  theme: string;
  color?: string;
}

export const createCompletionItems = (
  config: Config,
  cssVars: CSSVarRecord,
  options: {
    region?: Region | null;
    languageId: SupportedLanguageIds;
  } = { languageId: "css" }
) => {
  const vars = getCSSDeclarationArray(cssVars);
  const size = vars.length;
  return vars.reduce<CompletionItem[]>((items, cssVar, index) => {
    const KIND = cssVar.color
      ? CompletionItemKind.Color
      : CompletionItemKind.Variable;
    const extra = cssVar.theme !== "" ? `\n\nTheme: [${cssVar.theme}]` : "";
    const propertyName = `${cssVar.property}`;
    const item = new CompletionItem(propertyName, KIND);
    item.detail = `Value: ${cssVar.value}${extra}`;
    item.documentation = cssVar.color || cssVar.value;
    if (options.region) {
      let insertText: string;
      if (options.region.insideVar) {
        insertText = cssVar.property;
      } else {
        insertText = `var(${cssVar.property})`;
      }
      if (
        !SUFFIX.test(options.region.suffixChar) &&
        !isCSSInJS(options.languageId)
      ) {
        insertText += ";";
      }
      item.insertText = insertText;
      item.range = options.region.range;
      disableDefaultSort(config, item, { size, index });
    }
    items.push(item);
    return items;
  }, []);
};
