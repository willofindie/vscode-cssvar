import {
  CompletionItemProvider,
  CompletionList,
  Position,
  Range,
  TextDocument,
} from "vscode";
import { CACHE, SupportedLanguageIds } from "./constants";

import { createCompletionItems } from "./main";
import { restrictIntellisense } from "./utils";

export class CssCompletionProvider implements CompletionItemProvider {
  async provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Promise<CompletionList | null> {
    const firstInLine = new Position(position.line, 0);
    const language: SupportedLanguageIds = document.languageId as SupportedLanguageIds;

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
    const completionItems = createCompletionItems(CACHE.config, CACHE.cssVars, {
      region,
      languageId: language,
    });
    return new CompletionList(completionItems);
  }
}
