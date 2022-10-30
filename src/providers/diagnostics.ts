import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  ExtensionContext,
  Range,
  TextDocument,
  window,
  workspace,
} from "vscode";
import {
  CACHE,
  EXTENSION_NAME,
  PATTERN_ALL_VARIABLE_USAGES,
} from "../constants";

function createDiagnostic(
  match: RegExpMatchArray,
  lineIndex: number
): Diagnostic | null {
  const variableName = match[1].trim();
  const mode = CACHE.config[CACHE.activeRootPath].mode;
  const ignoreRegex = mode[1].ignore;
  if (
    CACHE.cssVarsMap[CACHE.activeRootPath][variableName] ||
    (ignoreRegex && ignoreRegex.test(variableName))
  ) {
    return null;
  }

  const start = match.index
    ? match.index + (match[0].length - match[1].length - 1)
    : 0;
  const end = start + match[1].length;
  const range = new Range(lineIndex, start, lineIndex, end);

  const diagnostic = new Diagnostic(
    range,
    `Cannot find cssvar ${variableName}.`,
    mode[0] === "error" ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning
  );
  diagnostic.source = `(${EXTENSION_NAME})`;

  // Following can be used to enhance diagnostics using codeactions
  // to modify code if a variable is not present, like adding a variable.
  // diagnostic.code = `${EXTENSION_NAME}_mention`;
  return diagnostic;
}

/**
 * Analyzes the text document for css variables that
 * aren't defined in the source CSS files.
 * @param doc text document to analyze
 * @param cssvarDiagnostics diagnostic collection
 */
export function refreshDiagnostics(
  doc: TextDocument,
  cssvarDiagnostics: DiagnosticCollection
): void {
  if (
    !CACHE.config[CACHE.activeRootPath].extensions.includes(
      doc.languageId as any
    ) ||
    CACHE.cssVarCount[CACHE.activeRootPath] === 0 ||
    CACHE.config[CACHE.activeRootPath].mode[0] === "off"
  ) {
    // This can happen if the extension fails to parse everything
    // In which case we do not want to show any diagnostic errors/warns
    return;
  }

  const diagnostics: Diagnostic[] = [];

  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    const lineOfText = doc.lineAt(lineIndex);
    const allMatchesInLine = lineOfText.text.matchAll(
      PATTERN_ALL_VARIABLE_USAGES
    );
    for (const match of allMatchesInLine) {
      const diagnostic = createDiagnostic(match, lineIndex);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }
  }

  cssvarDiagnostics.set(doc.uri, diagnostics);
}

export function subscribeToDocumentChanges(
  context: ExtensionContext,
  cssvarDiagnostics: DiagnosticCollection
): void {
  if (window.activeTextEditor) {
    refreshDiagnostics(window.activeTextEditor.document, cssvarDiagnostics);
  }
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        refreshDiagnostics(editor.document, cssvarDiagnostics);
      }
    })
  );

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(e =>
      refreshDiagnostics(e.document, cssvarDiagnostics)
    )
  );

  context.subscriptions.push(
    workspace.onDidCloseTextDocument(doc => cssvarDiagnostics.delete(doc.uri))
  );
}
