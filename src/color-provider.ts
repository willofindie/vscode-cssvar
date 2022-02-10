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
import { parseToRgb } from "polished";
import type { RgbaColor } from "polished/lib/types/color";
import { CACHE } from "./constants";
import { isObjectEmpty } from "./utils";
import { setup } from "./main";
import { parseFiles } from "./parser";

const getChunkRange = (startLineNumber: number, endLineNumber: number): Range =>
  new Range(new Position(startLineNumber, 0), new Position(endLineNumber, 0));
export class CssColorProvider implements DocumentColorProvider {
  async provideDocumentColors(
    document: TextDocument
  ): Promise<ColorInformation[]> {
    if (isObjectEmpty(CACHE.config)) {
      // Config won't change a lot of time.
      await setup();
    }
    await parseFiles(CACHE.config);

    const eol = document.eol === EndOfLine.CRLF ? "\r\n" : "\n";
    const colorInfo: ColorInformation[] = [];
    /**
     * FIXME: document.getText() contains unsaved text as well.
     * This is crucial, as the range keeps on changing for the Color Info
     * Not sure why but VScode doesn't provide any Buffer instead of text for
     * huge file content.
     * That means I will have to work upon the entire text all at once.
     */

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
            const color = parseToRgb(hexColor) as RgbaColor;
            const info = {
              color: new Color(
                color.red / 255,
                color.green / 255,
                color.blue / 255,
                color.alpha ?? 1
              ),
              range: new Range(
                new Position(exactLineNumber, cssVarMatch.index),
                new Position(exactLineNumber, cssVarMatch.index + match.length)
              ),
            };
            colorInfo.push(info);
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
