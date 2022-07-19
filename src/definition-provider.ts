import {
  Definition,
  DefinitionProvider,
  LocationLink,
  Position,
  Range,
  TextDocument,
} from "vscode";
import { CACHE } from "./constants";
import { getActiveRootPath } from "./utils";

export class CssDefinitionProvider implements DefinitionProvider {
  async provideDefinition(
    document: TextDocument,
    position: Position
  ): Promise<Definition | LocationLink[]> {
    const text = document.getText(
      new Range(
        position.translate({ characterDelta: -position.character }),
        position.with({ line: position.line + 1, character: 0 })
      )
    );

    const matches = text.matchAll(/var\s*\((.*?)\)/g);
    let exactMatch = "";
    for (const match of matches) {
      const start = match.index
        ? match.index + (match[0].length - match[1].length - 1)
        : 0;
      const end = start + match[1].length;
      if (position.character >= start && position.character <= end) {
        exactMatch = match[1];
        break;
      }
    }

    CACHE.activeRootPath = getActiveRootPath();
    const locations =
      CACHE.cssVarDefinitionsMap[CACHE.activeRootPath][exactMatch];

    return locations;
  }
}
