import {
  languages,
  window,
  ExtensionContext,
  CompletionList,
  Position,
  Range,
} from "vscode";
import { DEFAULT_CONFIG, FILTER_REGEX } from "./defaults";
import { createCompletionItems, parseFiles, setup } from "./main";

/**
 * Main Function from where the Plugin loads
 * @param context
 */
export function activate(context: ExtensionContext): void {
  try {
    const { config } = setup();
    const disposable = languages.registerCompletionItemProvider(
      config.extensions || DEFAULT_CONFIG.extensions,
      {
        async provideCompletionItems(document, position) {
          const firstInLine = new Position(position.line, 0);
          const textFromStart =
            document.getText(new Range(firstInLine, position)) || "";

          if (
            !FILTER_REGEX.test(textFromStart) ||
            /^[\s\t]*-{1,2}\w?/.test(textFromStart)
          ) {
            return null;
          }

          const { config } = setup();
          const cssVars = await parseFiles(config);
          const completionItems = createCompletionItems(cssVars);
          return new CompletionList(completionItems);
        },
      },
      "-",
      "-",
      "v",
      "a",
      "r",
      "(",
      ")"
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
