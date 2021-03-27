import {
  languages,
  window,
  ExtensionContext,
  CompletionList,
  Position,
  Range,
} from "vscode";
import { DEFAULT_CONFIG } from "./defaults";
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
        async provideCompletionItems(
          document,
          position,
          _token,
          _completionContext
        ) {
          const { config } = setup();
          const cssVars = await parseFiles(config);
          const firstCharOfLinePosition = new Position(position.line, 0);
          const cssInput =
            document
              .getText(new Range(firstCharOfLinePosition, position))
              ?.trim() || "";

          console.log(cssInput);

          if (!cssInput.match(/--([\w-]*)/)) {
            return null;
          }

          const completionItems = createCompletionItems(cssVars);
          return new CompletionList(completionItems);
        },
      },
      "-",
      "-"
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
