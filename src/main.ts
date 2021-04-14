import { CompletionItem, CompletionItemKind, workspace } from "vscode";
import { resolve } from "path";
import fastGlob from "fast-glob";
import { NoWorkspaceError } from "./errors";
import {
  Config,
  CSSVarRecord,
  DEFAULT_CONFIG,
  EXTENSION_NAME,
  mapShortToFullExtension,
  SupportedExtensionNames,
} from "./constants";
import { getCSSDeclarationArray, isObjectProperty } from "./utils";

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
  color?: string;
}

export const createCompletionItems = (
  cssVars: CSSVarRecord,
  predicate?: (cssVar: CSSVarDeclarations) => boolean
) => {
  const vars = getCSSDeclarationArray(cssVars);
  return vars.reduce<CompletionItem[]>((items, cssVar) => {
    if (!predicate || predicate(cssVar)) {
      const KIND = cssVar.color
        ? CompletionItemKind.Color
        : CompletionItemKind.Variable;
      const extra = cssVar.theme !== "" ? `\n\nTheme: [${cssVar.theme}]` : "";
      const propertyName = `${cssVar.property}`;
      const item = new CompletionItem(propertyName, KIND);
      item.detail = `Value: ${cssVar.value}${extra}`;
      item.documentation = cssVar.color || cssVar.value;
      item.insertText = `var(${cssVar.property});`;
      items.push(item);
    }
    return items;
  }, []);
};
