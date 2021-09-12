import {
  languages,
  window,
  ExtensionContext,
  CompletionList,
  Position,
  Range,
} from "vscode";
import {
  DEFAULT_CONFIG,
  FILTER_REGEX,
  SupportedLanguageIds,
} from "./constants";
import { createCompletionItems, getRegion, setup } from "./main";
import { parseFiles } from "./parser";

const restrictIntellisense = (text: string) => {
  return !FILTER_REGEX.test(text) || /^[\s\t]*-{1,2}\w?$/.test(text);
};

/**
 * Main Function from where the Plugin loads
 * @param context
 */
export async function activate(context: ExtensionContext): Promise<void> {
  try {
    const { config } = await setup();
    const disposable = languages.registerCompletionItemProvider(
      config.extensions || DEFAULT_CONFIG.extensions,
      {
        async provideCompletionItems(document, position) {
          const firstInLine = new Position(position.line, 0);
          const range = new Range(firstInLine, position);
          const textFromStart = document.getText(range) || "";
          const language: SupportedLanguageIds = document.languageId as SupportedLanguageIds;
          const { config } = await setup();

          // Editing Theme File should be restricted
          if (restrictIntellisense(textFromStart)) {
            return null;
          }

          /**
           * VSCode auto-fills extra characters post our current cursor position sometimes
           * like typing `var(;` adds `var();` in css files. we can have 2 or more characters
           * post our current cursor position.
           *
           * Taking 5 extra characters make sure we do not miss any extra characters post our cursor
           * position, but vscode will take the minimum characters present post cursor position, i.e.
           * if there are only 2 more charaters post the cursors position, range will be between (0, n+2)
           * not n + 5.
           */
          const rangeWithTerminator = new Range(
            firstInLine,
            position.with(position.line, position.character + 5)
          );
          const moreText = document.getText(rangeWithTerminator);
          const region = getRegion(moreText, range);

          const [cssVars, errorPaths] = await parseFiles(config);
          if (errorPaths.length > 0) {
            const relativePaths = errorPaths;
            window.showWarningMessage(
              "Failed to parse CSS variables in files:",
              `\n\n${relativePaths.join("\n\n")}`
            );
          }
          const completionItems = createCompletionItems(cssVars, {
            region,
            languageId: language,
          });
          return new CompletionList(completionItems);
        },
      },
      "-",
      "v",
      "a",
      "r",
      "("
    );
    context.subscriptions.push(disposable);
  } catch (err) {
    if (err instanceof Error) {
      window.showErrorMessage(err.message);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  // NOOP
}
