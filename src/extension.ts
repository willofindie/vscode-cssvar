import {
  languages,
  window,
  ExtensionContext,
  workspace,
  FileSystemWatcher,
  RelativePattern,
  TextEditor,
} from "vscode";
import { CssColorProvider } from "./providers/color-provider";
import { CssCompletionProvider } from "./providers/completion-provider";
import { CACHE, DEFAULT_CONFIG, EXTENSION_NAME } from "./constants";
import { CssDefinitionProvider } from "./providers/definition-provider";
import { LOGGER } from "./logger";
import { setup } from "./main";
import { parseFiles } from "./parser";
import { isObjectProperty } from "./utils";
import { CssHoverProvider } from "./providers/hover-provider";
import { subscribeToDocumentChanges } from "./providers/diagnostics";

const watchers: FileSystemWatcher[] = [];

/**
 * Main Function from where the Plugin loads
 * @param context
 */
export async function activate(context: ExtensionContext): Promise<void> {
  try {
    const { config } = await setup();
    const [, errorPaths] = await parseFiles(config, { parseAll: true }); // Cache Parsed CSS Vars for all Root folders
    if (errorPaths.length > 0) {
      const relativePaths = errorPaths;
      window.showWarningMessage(
        "Failed to parse CSS variables in files:",
        `\n\n${relativePaths.join("\n\n")}`
      );
    }

    const completionDisposable = languages.registerCompletionItemProvider(
      config[CACHE.activeRootPath].extensions || DEFAULT_CONFIG.extensions,
      new CssCompletionProvider(),
      "-",
      "v",
      "a",
      "r",
      "("
    );
    context.subscriptions.push(completionDisposable);

    if (config[CACHE.activeRootPath].enableColors) {
      const colorDisposable = languages.registerColorProvider(
        config[CACHE.activeRootPath].extensions || DEFAULT_CONFIG.extensions,
        new CssColorProvider()
      );
      context.subscriptions.push(colorDisposable);
    }

    if (config[CACHE.activeRootPath].enableGotoDef) {
      const definitionDisposable = languages.registerDefinitionProvider(
        config[CACHE.activeRootPath].extensions || DEFAULT_CONFIG.extensions,
        new CssDefinitionProvider()
      );
      context.subscriptions.push(definitionDisposable);
    }

    if (config[CACHE.activeRootPath].enableHover) {
      const definitionDisposable = languages.registerHoverProvider(
        config[CACHE.activeRootPath].extensions || DEFAULT_CONFIG.extensions,
        new CssHoverProvider()
      );
      context.subscriptions.push(definitionDisposable);
    }

    const cssvarDiagnostics =
      languages.createDiagnosticCollection(EXTENSION_NAME);
    context.subscriptions.push(cssvarDiagnostics);
    subscribeToDocumentChanges(context, cssvarDiagnostics);

    //#region File Watcher
    /**
     * Following code will help in watching file changes, without any 3rd-party libs
     * This helps to re-calculate CSS Variables, if there is any change.
     */
    const watchers: FileSystemWatcher[] = [];
    const folders = workspace.workspaceFolders || [];
    for (const folder of folders) {
      for (const path of CACHE.filesToWatch[folder.uri.fsPath]) {
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
          // Though I don't think this is of any benefit.
          CACHE.filesToWatch[folder.uri.fsPath].delete(uri.fsPath);
        });

        watchers.push(watcher);
      }
    }
    //#endregion

    context.subscriptions.push(
      window.onDidChangeActiveTextEditor(updateStatus)
    );
  } catch (err) {
    if (err instanceof Error) {
      window.showErrorMessage(err.message);
      LOGGER.warn("Failed to Activate extension: ", err);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  watchers.forEach(watcher => {
    watcher.dispose();
  });
}

/**
 * References:
 *  - https://github.com/microsoft/vscode-extension-samples/blob/main/basic-multi-root-sample/src/extension.ts
 *  - https://github.com/Microsoft/vscode-extension-samples/blob/main/configuration-sample/src/extension.ts
 */
function updateStatus(event: TextEditor | undefined) {
  if (event) {
    if (isObjectProperty(event, "document")) {
      const rootPath =
        workspace.getWorkspaceFolder((<TextEditor>event).document.uri)?.uri
          .fsPath || CACHE.activeRootPath;
      CACHE.activeRootPath = rootPath;
    }
  }
}
