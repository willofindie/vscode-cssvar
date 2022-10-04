import {
  CompletionItem,
  CompletionItemKind,
  Location,
  workspace,
  WorkspaceConfiguration,
} from "vscode";
import { tmpdir } from "os";
import { mkdirSync } from "fs";
import { resolve } from "path";
import fastGlob from "fast-glob";
import {
  CACHE,
  Config,
  CSSVarLocation,
  CSSVarRecord,
  DEFAULT_CONFIG,
  EXTENSION_NAME,
  mapShortToFullExtension,
  SUFFIX,
  SupportedExtensionNames,
  SupportedLanguageIds,
  WorkspaceConfig,
} from "./constants";
import {
  getCSSDeclarationArray,
  isCSSInJS,
  isObjectProperty,
  Region,
  getActiveRootPath,
  getRemoteCSSVarLocation,
} from "./utils";
import { disableDefaultSort } from "./unstable";

/**
 * Use this function only when getting values from VSCode's
 * configuration.
 */
const getConfigValue = <T extends keyof WorkspaceConfig>(
  config: WorkspaceConfiguration,
  key: T
): WorkspaceConfig[typeof key] => {
  let value = config.get<WorkspaceConfig[typeof key]>(key);
  if (value == null) {
    // Only overrride, if extension setting is untouched
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
  if (!CACHE.tmpDir) {
    CACHE.tmpDir = resolve(tmpdir(), EXTENSION_NAME);
    mkdirSync(CACHE.tmpDir, { recursive: true });
  }

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
            const values = getConfigValue(_config, key) as string[];
            const ignoreList = getConfigValue(_config, "ignore");
            const [localGlobs, remoteRoutes] = values.reduce(
              (globs: [string[], CSSVarLocation[]], glob) => {
                if (glob.startsWith("http")) {
                  const remoteCssvarLocation = getRemoteCSSVarLocation(glob);
                  globs[1].push(remoteCssvarLocation);
                } else {
                  globs[0].push(glob);
                }
                return globs;
              },
              [[], []]
            );
            const localEntries = await fastGlob(localGlobs, {
              cwd: resourcePath,
              ignore: ignoreList,
            });
            const entries = [...localEntries, ...remoteRoutes];
            config[fsPathKey][key] = entries.map<CSSVarLocation>(
              (path: string | CSSVarLocation) => {
                if (typeof path === "string") {
                  return {
                    local: resolve(resourcePath, path),
                    remote: "",
                    isRemote: false,
                  };
                } else {
                  return path;
                }
              }
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
          case "postcssPlugins": {
            const _plugins =
              _config.get<WorkspaceConfig["postcssPlugins"]>(key);
            let plugins: Config["postcssPlugins"] = [];
            if (_plugins) {
              plugins = _plugins
                .map(plugin => {
                  if (Array.isArray(plugin) && plugin.length > 0) {
                    return [plugin[0], plugin[1] || {}];
                  } else if (typeof plugin === "string") {
                    return [plugin, {}];
                  } else {
                    return null;
                  }
                })
                .filter(Boolean) as Config["postcssPlugins"];
            }
            config[fsPathKey][key] = plugins;
            break;
          }
          case "postcssSyntax": {
            const syntaxes = _config.get<Record<string, string[]>>(key);
            if (syntaxes && !Array.isArray(syntaxes)) {
              config[fsPathKey][key] = Object.keys(syntaxes).reduce(
                (syntaxMap, key) => {
                  if (isObjectProperty(syntaxes, key)) {
                    const exts = syntaxes[key];
                    exts.forEach(ext => {
                      syntaxMap[ext] = key;
                    });
                  }
                  return syntaxMap;
                },
                {} as Config["postcssSyntax"]
              );
            } else {
              config[fsPathKey][key] = {};
            }
            break;
          }
          case "mode": {
            const mode = _config.get<WorkspaceConfig["mode"]>(key);
            let _mode: Config["mode"];
            if (typeof mode === "string") {
              _mode = [mode, {}];
            } else if (
              Array.isArray(mode) &&
              mode.length > 0 &&
              mode.length < 3
            ) {
              let ignoreRegex = null;
              if (mode[1].ignore.length > 0) {
                ignoreRegex = new RegExp(
                  mode[1].ignore
                    .reduce((str, current) => {
                      str.push(`(${current})`);
                      return str;
                    }, [] as string[])
                    .join("|")
                );
              }
              _mode = [mode[0], { ignore: ignoreRegex || null }];
            } else {
              _mode = ["off", {}];
            }
            config[fsPathKey][key] = _mode;
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
  real: string;
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
