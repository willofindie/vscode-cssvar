import {
  CompletionItem,
  CompletionItemKind,
  Location,
  workspace,
  WorkspaceConfiguration,
} from "vscode";
import { resolve } from "path";
import fastGlob from "fast-glob";
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
  getActiveRootPath,
} from "./utils";
import { disableDefaultSort } from "./unstable";

const getConfigValue = <T extends keyof Config>(
  config: WorkspaceConfiguration,
  key: T
): Config[typeof key] => {
  let value = config.get<Config[typeof key]>(key) || DEFAULT_CONFIG[key];
  if (Array.isArray(value) && value.length === 0) {
    value = DEFAULT_CONFIG[key];
  }
  return value;
};

/**
 * Initializes the Plugin
 */
export async function setup(): Promise<{
  config: { [fsPath: string]: Config };
}> {
  const workspaceFolders = workspace.workspaceFolders || [];
  const firstFolderPath = workspaceFolders[0]?.uri.fsPath;
  const config = {} as { [fsPath: string]: Config };

  CACHE.activeRootPath = getActiveRootPath(firstFolderPath);

  for (const folder of workspaceFolders) {
    const _config = workspace.getConfiguration(EXTENSION_NAME, folder.uri);
    const resourcePath = folder.uri.fsPath;
    const fsPathKey = folder.uri.fsPath;

    if (!config[fsPathKey]) {
      config[fsPathKey] = {} as Config;
    }

    for (const key in DEFAULT_CONFIG) {
      if (isObjectProperty(DEFAULT_CONFIG, key)) {
        switch (key) {
          case "files": {
            const value = getConfigValue(_config, key);
            const ignoreList = getConfigValue(_config, "ignore");
            const entries = await fastGlob(<string[]>value, {
              cwd: resourcePath,
              ignore: ignoreList,
            });
            config[fsPathKey][key] = entries.map((path: string) =>
              resolve(resourcePath, path)
            );
            break;
          }
          case "extensions": {
            const value = getConfigValue(_config, key);
            config[fsPathKey][key] = value.map(ext => {
              const _ext = ext.startsWith(".")
                ? (ext.substring(1) as SupportedExtensionNames)
                : ext;
              return mapShortToFullExtension(_ext);
            });
            break;
          }
          default: {
            const value = getConfigValue(_config, key);
            config[fsPathKey][key] = value as any;
            break;
          }
        }
      }
    }
  }

  CACHE.config = config;

  return {
    config: CACHE.config,
  };
}

export interface CSSVarDeclarations {
  type: "css" | "sass" | "less";
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
