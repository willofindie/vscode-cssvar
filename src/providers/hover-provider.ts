import {
  CancellationToken,
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  Range,
  TextDocument,
} from "vscode";
import { CACHE } from "../constants";
import { getActiveRootPath } from "../utils";

const getMDString = (
  prop: string,
  realValue: string,
  renderedValue: string,
  theme: string
) => {
  const mdString = new MarkdownString("__Variable Details__\n", true);
  mdString.appendCodeblock(`${prop}: ${realValue};`, "scss");
  mdString.appendMarkdown(
    `- Rendered: \`${renderedValue}\`\n${
      theme !== "" ? `- Theme: [\`${theme}\`]` : "- Theme: _none_"
    } \n`
  );
  return mdString;
};

export class CssHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    _: CancellationToken
  ): Hover | null {
    const range = new Range(
      position.translate({ characterDelta: -position.character }),
      position.with({ line: position.line + 1, character: 0 })
    );
    const text = document.getText(range);

    const matches = text.matchAll(/var\s*\((.*?)\)/g);
    let hoverDetails: {
      name: string;
      range: Range;
    } | null = null;
    for (const match of matches) {
      const start = match.index
        ? match.index + (match[0].length - match[1].length - 1)
        : 0;
      const end = start + match[1].length;
      if (position.character >= start && position.character <= end) {
        hoverDetails = {
          name: match[1].trim(),
          range: new Range(
            range.start.translate({ characterDelta: start }),
            range.start.translate({ characterDelta: end })
          ),
        };
        break;
      }
    }

    if (hoverDetails) {
      CACHE.activeRootPath = getActiveRootPath();
      const varDetails =
        CACHE.cssVarsMap[CACHE.activeRootPath][hoverDetails.name];
      if (varDetails) {
        const content = getMDString(
          varDetails.property,
          varDetails.real,
          varDetails.color || varDetails.value,
          varDetails.theme
        );
        return new Hover(content, hoverDetails.range);
      }
    }

    return null;
  }
}
