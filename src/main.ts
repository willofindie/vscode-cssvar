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
  UNSTABLE_FEATURES,
} from "./constants";
import { getCSSDeclarationArray, isCSSInJS, isObjectProperty } from "./utils";
import { disableDefaultSort } from "./unstable";

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
        case "unstable": {
          const value =
            _config.get<Config[typeof key]>(key) || DEFAULT_CONFIG[key];
          value.forEach(featureKey => {
            UNSTABLE_FEATURES[featureKey] = true;
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

/**
 * Get the region containing the --variable to be replaced later with specific selected
 * CSS Variable name. The range returned as part of Region, will start from `--`.
 *
 * @param {string} line current line where cursor is present
 * @param {Range} currentRange Current Selected range pointing to the start and end of css variable trigger
 * @returns {Region} region containing the characters in the line to be replaced with css variable
 */
export const getRegion = (line: string, currentRange: Range): Region => {
  const match = line.match(FILTER_REGEX);
  const cursorPosition = currentRange.end;

  const findRegion = (start: number, offset: number): Region => {
    const range = new Range(
      cursorPosition.with(cursorPosition.line, start),
      cursorPosition.with(cursorPosition.line, start + offset)
    );
    const suffixChar = line.charAt(line.length - 1);
    const insideVar = /var\(/.test(line);
    return {
      range,
      suffixChar,
      insideVar,
    };
  };

  if (match) {
    const filtered = match.groups?.var || "";
    const startPosition = line.search(filtered);
    // Get a range starting from cursor's position minus total number
    // of characters already typed by user to trigger the intellisense
    // i.e. characters post `--` and including `--`
    return findRegion(startPosition, filtered.length);
  } else {
    // Due to some variations in how VSCode triggers this plugin's `activate` method
    // this else condition is required, and we need to return a region, when
    // this plugin is activated and we have a match that resembles our trigger regex, i.e. FILTER_REGEX.

    /**
     * If this https://github.com/microsoft/vscode/issues/38982 issue is read carefully, range returned
     * from this function is run with the text, when `provideCompletionItems` is triggered. So,
     * if this method returns a range between `0-3` where 0 is `-` and 3 is `;` for text `--);`,
     * then `);` will also be replaced with selection, which is not desired.
     * For e.g. take following examples of text, when `provideCompletionItems` gets triggered:
     *  - `: -);` - if range returned is [2, 5], then everything beyond `: ` will be replaced by insertText
     *
     * To keep this in check we should remove the last two chars from `endString`, if they contain
     * `);` at the end. Even simpler solution would be to keep the offset sized 1 always.
     */
    const colonIndex = line.search(":");
    const endString = line.slice(colonIndex);
    const index = endString.search(/-{1,2}\w*?/);
    const offset = endString.length - (index === -1 ? endString.length : index);
    const startPosition = line.length - offset;
    return findRegion(startPosition, 1);
  }
};

export const createCompletionItems = (
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
      disableDefaultSort(item, { size, index });
    }
    items.push(item);
    return items;
  }, []);
};
