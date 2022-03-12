import {
  DocumentColorProvider,
  ColorInformation,
  TextDocument,
  Color,
  Range,
  ColorPresentation,
  EndOfLine,
  Position,
} from "vscode";
import { parseToRgb } from "./color-parser";
import { CACHE } from "./constants";

const getChunkRange = (startLineNumber: number, endLineNumber: number): Range =>
  new Range(new Position(startLineNumber, 0), new Position(endLineNumber, 0));

export class CssColorProvider implements DocumentColorProvider {
  async provideDocumentColors(
    document: TextDocument
  ): Promise<ColorInformation[]> {
    const eol = document.eol === EndOfLine.CRLF ? "\r\n" : "\n";
    const colorInfo: ColorInformation[] = [];

    // Assuming the worst case that each line has 120 characters (for JS like files)
    // 500 lines will contain at-max 500 * 120 = 60000 chars, which is very close to
    // 2^16 = 65536 max bytes provided by stream chunks.
    const linesRead = 500;
    let lineOffset = 0;
    let text = document.getText(
      getChunkRange(lineOffset, lineOffset + linesRead)
    );
    while (text) {
      const lines = text.split(eol);
      lines.pop(); // Last line will be handled in next loop
      lines.forEach((line, lineNumer) => {
        const matches = line ? line.matchAll(/var\s*\((.*?)\)/g) : [];
        const exactLineNumber = lineNumer + lineOffset;
        for (const cssVarMatch of matches) {
          const match = cssVarMatch[0];
          const key = cssVarMatch[1].trim();
          const hexColor = CACHE.cssVarsMap[key]?.color;
          if (hexColor && cssVarMatch.index) {
            const color = parseToRgb(hexColor);
            if (color) {
              const info = {
                color: new Color(color.r, color.g, color.b, color.alpha ?? 1),
                range: new Range(
                  new Position(exactLineNumber, cssVarMatch.index),
                  new Position(
                    exactLineNumber,
                    cssVarMatch.index + match.length
                  )
                ),
              };
              colorInfo.push(info);
            }
          }
        }
      });
      lineOffset += linesRead;
      text = document.getText(
        getChunkRange(lineOffset, lineOffset + linesRead)
      );
    }
    return colorInfo;
  }

  async provideColorPresentations(
    _color: Color,
    _context: { document: TextDocument; range: Range }
  ): Promise<ColorPresentation[]> {
    const colorPresentations: ColorPresentation[] = [];

    // colorPresentations.push(
    //   new ColorPresentation(
    //     `${color.red}${color.green}${color.blue}${
    //       color.alpha
    //     } ::: ${document.getText(range)}`
    //   )
    // );

    return colorPresentations;
  }
}
