import {
  languages,
  window,
  ExtensionContext,
  CompletionList,
  Position,
  Range,
} from "vscode";
import { CssColorProvider } from "./color-provider";
import { DEFAULT_CONFIG, SupportedLanguageIds } from "./constants";
import { createCompletionItems, setup } from "./main";
import { parseFiles } from "./parser";
import { restrictIntellisense } from "./utils";

/**
 * Main Function from where the Plugin loads
 * @param context
 */
export async function activate(context: ExtensionContext): Promise<void> {
  try {
    const { config } = await setup();
    const completionDisposable = languages.registerCompletionItemProvider(
      config.extensions || DEFAULT_CONFIG.extensions,
      {
        async provideCompletionItems(document, position) {
          const firstInLine = new Position(position.line, 0);
          const language: SupportedLanguageIds = document.languageId as SupportedLanguageIds;
          const { config } = await setup();

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
          const textFromStart = document.getText(rangeWithTerminator) || "";

          // Editing Theme File should be restricted
          const regions = restrictIntellisense(
            textFromStart,
            language,
            rangeWithTerminator
          );
          if (regions.length === 0) {
            return null;
          }

          const region = regions[regions.length - 1];

          const [cssVars, errorPaths] = await parseFiles(config);
          if (errorPaths.length > 0) {
            const relativePaths = errorPaths;
            window.showWarningMessage(
              "Failed to parse CSS variables in files:",
              `\n\n${relativePaths.join("\n\n")}`
            );
          }
          const completionItems = createCompletionItems(config, cssVars, {
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
    context.subscriptions.push(completionDisposable);

    if (config.enableColors) {
      const colorDisposable = languages.registerColorProvider(
        config.extensions || DEFAULT_CONFIG.extensions,
        new CssColorProvider()
      );
      context.subscriptions.push(colorDisposable);
    }
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
