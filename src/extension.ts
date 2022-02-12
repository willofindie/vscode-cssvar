import {
  languages,
  window,
  ExtensionContext,
  workspace,
  FileSystemWatcher,
} from "vscode";
import { CssColorProvider } from "./color-provider";
import { CssCompletionProvider } from "./completion-provider";
import { DEFAULT_CONFIG } from "./constants";
import { CssDefinitionProvider } from "./definition-provider";
import { setup } from "./main";
import { parseFiles } from "./parser";

let watcher: FileSystemWatcher;

/**
 * Main Function from where the Plugin loads
 * @param context
 */
export async function activate(context: ExtensionContext): Promise<void> {
  try {
    const { config } = await setup();
    const [, errorPaths] = await parseFiles(config); // Cache Parsed CSS Vars
    if (errorPaths.length > 0) {
      const relativePaths = errorPaths;
      window.showWarningMessage(
        "Failed to parse CSS variables in files:",
        `\n\n${relativePaths.join("\n\n")}`
      );
    }

    const completionDisposable = languages.registerCompletionItemProvider(
      config.extensions || DEFAULT_CONFIG.extensions,
      new CssCompletionProvider(),
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

    if (config.enableGotoDef) {
      const definitionDisposable = languages.registerDefinitionProvider(
        config.extensions || DEFAULT_CONFIG.extensions,
        new CssDefinitionProvider()
      );
      context.subscriptions.push(definitionDisposable);
    }

    let matchString = "";
    if (Array.isArray(config.files)) {
      matchString = config.files.join("|");
    } else {
      const files = config.files;
      matchString = Object.keys(files)
        .map((key: string) => files[key]?.join("|"))
        .join("|");
    }

    watcher = workspace.createFileSystemWatcher(matchString);
    watcher.onDidChange(async () => {
      const [, errorPaths] = await parseFiles(config); // Cache Parsed CSS Vars
      if (errorPaths.length > 0) {
        const relativePaths = errorPaths;
        window.showWarningMessage(
          "Failed to parse CSS variables in files:",
          `\n\n${relativePaths.join("\n\n")}`
        );
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      window.showErrorMessage(err.message);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  watcher?.dispose();
}
