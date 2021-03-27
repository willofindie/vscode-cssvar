import { CompletionItem, CompletionItemKind, workspace } from "vscode";
import { resolve } from "path";
import { readFile } from "fs";
import { promisify } from "util";
import { parse, Rule, Declaration, Stylesheet } from "css";
import { NoWorkspaceError } from "./errors";
import { Config, DEFAULT_CONFIG, EXTENSION_NAME } from "./defaults";

const readFileAsync = promisify(readFile);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isObjectProperty = <T>(obj: T, key: any): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

/**
 * Sets up the Plugin
 *
 * @throws {@link NoWorkspaceError}
 */
export function setup() {
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

const SUPPORTED_TYPES = ["rule", "declaration"];
const CSS_VAR_REGEX = /^[\s\t]*--/;
interface CSSVarDeclarations {
  property: string;
  value: string;
}

const cssParseAsync = (file: string): Promise<Stylesheet> =>
  new Promise(res => {
    res(parse(file));
  });

export async function parseFiles(config: Config) {
  let cssVars: CSSVarDeclarations[] = [];
  for (const path of config.files) {
    const file = await readFileAsync(path, { encoding: "utf8" });
    const css = await cssParseAsync(file);
    cssVars =
      css.stylesheet?.rules.reduce<CSSVarDeclarations[]>(
        (declarations, rule: Rule) => {
          if (
            !!rule.type &&
            rule.type === SUPPORTED_TYPES[0] &&
            !!rule.declarations
          ) {
            rule.declarations?.forEach((declaration: Declaration) => {
              const property = declaration.property || "";
              if (
                rule.selectors &&
                declaration.type === SUPPORTED_TYPES[1] &&
                CSS_VAR_REGEX.test(property)
              ) {
                declarations.push({
                  property,
                  value: declaration.value || "",
                });
              }
            });
          }
          return declarations;
        },
        []
      ) || [];
  }
  return cssVars;
}

export const createCompletionItems = (
  cssVars: CSSVarDeclarations[],
  predicate?: (cassVar: CSSVarDeclarations) => boolean
) =>
  cssVars.reduce<CompletionItem[]>((items, cssVar) => {
    if (!predicate || predicate(cssVar)) {
      const item = new CompletionItem(
        cssVar.property,
        CompletionItemKind.Variable
      );
      item.detail = cssVar.value;
      item.insertText = `var(${cssVar.property})`;
      items.push(item);
    }
    return items;
  }, []);
