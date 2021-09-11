import { CompletionItem, CompletionItemKind, Range, workspace } from "vscode";
import { resolve } from "path";
import fastGlob from "fast-glob";
import { NoWorkspaceError } from "./errors";
import {
  Config,
  CSSVarRecord,
  DEFAULT_CONFIG,
  EXTENSION_NAME,
  FILTER_REGEX,
  mapShortToFullExtension,
  SUFFIX,
  SupportedExtensionNames,
  SupportedLanguageIds,
} from "./constants";
import { getCSSDeclarationArray, isCSSInJS, isObjectProperty } from "./utils";

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
      const value = _config.get<ValueOf<Config>>(key) || DEFAULT_CONFIG[key];
      switch (key) {
        case "files": {
          if (isMultiRoot) {
            const _value = <Record<string, string[]>>value;
            config[key] = [];
            for (const workspaceName of Object.keys(_value)) {
              const wFolder = workspace.workspaceFolders.find(w => {
                return new RegExp(workspaceName).test(w.name);
              });
              if (wFolder) {
                const _resourcePath = wFolder.uri.fsPath;
                const globs = _value[workspaceName];
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
        case "extensions":
          config[key] = (<SupportedExtensionNames[]>value).map(ext => {
            const _ext = ext.startsWith(".")
              ? (ext.substr(1) as SupportedExtensionNames)
              : ext;
            return mapShortToFullExtension(_ext);
          });
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
  color?: string;
}

export interface Region {
  range: Range;
  insideVar: boolean;
  suffixChar: string;
}

export const getRegion = (line: string, currentRange: Range) => {
  const match = line.match(FILTER_REGEX);
  if (match) {
    const filtered = match[1];
    const cursorPosition = currentRange.end;
    const range = new Range(
      cursorPosition.with(
        cursorPosition.line,
        cursorPosition.character - filtered.length + 1
      ),
      currentRange.end
    );
    const suffixChar = line.charAt(line.length - 1);
    const insideVar = /var\(/.test(line);
    return {
      range,
      suffixChar,
      insideVar,
    };
  }
  return null;
};

export const createCompletionItems = (
  cssVars: CSSVarRecord,
  options: {
    region?: Region | null;
    languageId: SupportedLanguageIds;
  } = { languageId: "css" }
) => {
  const vars = getCSSDeclarationArray(cssVars);
  return vars.reduce<CompletionItem[]>((items, cssVar) => {
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
    }
    items.push(item);
    return items;
  }, []);
};
