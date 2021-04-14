import {
  languages,
  window,
  ExtensionContext,
  CompletionList,
  Position,
  Range,
} from "vscode";
import { DEFAULT_CONFIG, FILTER_REGEX } from "./constants";
import { createCompletionItems, setup } from "./main";
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
          const textFromStart =
            document.getText(new Range(firstInLine, position)) || "";
          // const filename = document.fileName;
          const { config } = await setup();

          // Editing Theme File should be restricted
          if (restrictIntellisense(textFromStart)) {
            return null;
          }

          const cssVars = await parseFiles(config);
          const completionItems = createCompletionItems(cssVars);
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
