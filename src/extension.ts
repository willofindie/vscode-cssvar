import {
  languages,
  window,
  ExtensionContext,
  workspace,
  FileSystemWatcher,
  RelativePattern,
} from "vscode";
import { CssColorProvider } from "./color-provider";
import { CssCompletionProvider } from "./completion-provider";
import { CACHE, DEFAULT_CONFIG } from "./constants";
import { CssDefinitionProvider } from "./definition-provider";
import { LOGGER } from "./logger";
import { setup } from "./main";
import { parseFiles } from "./parser";

const watchers: FileSystemWatcher[] = [];

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

    const watchers: FileSystemWatcher[] = [];
    for (const path of CACHE.filesToWatch) {
      const relativePattern = new RelativePattern(path, "*");
      const watcher = workspace.createFileSystemWatcher(relativePattern);
      watcher.onDidChange(async () => {
        const [, errorPaths] = await parseFiles(CACHE.config); // Cache Parsed CSS Vars
        if (errorPaths.length > 0) {
          const relativePaths = errorPaths;
          window.showWarningMessage(
            "Failed to parse CSS variables in files:",
            `\n\n${relativePaths.join("\n\n")}`
          );
        }
      });

      watcher.onDidDelete(uri => {
        // THough I don't think this is of any benefit.
        CACHE.filesToWatch.delete(uri.path);
      });

      watchers.push(watcher);
    }
  } catch (err) {
    if (err instanceof Error) {
      window.showErrorMessage(err.message);
      LOGGER.warn(err);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  watchers.forEach(watcher => {
    watcher.dispose();
  });
}
