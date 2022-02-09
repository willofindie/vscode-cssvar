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
import fs from "fs";
import { CACHE } from "./constants";
import { isObjectEmpty } from "./utils";
import { setup } from "./main";
import { parseFiles } from "./parser";
import { parseToRgb } from "polished";
import type { RgbaColor } from "polished/lib/types/color";

export class CssColorProvider implements DocumentColorProvider {
  async provideDocumentColors(
    document: TextDocument
  ): Promise<ColorInformation[]> {
    return new Promise(res => {
      (async () => {
        if (isObjectEmpty(CACHE.cssVars)) {
          const { config } = await setup();
          // Create Cache if not present already.
          await parseFiles(config);
        }
      })().then(() => {
        const eol = document.eol === EndOfLine.CRLF ? "\r\n" : "\n";
        const colorInfo: ColorInformation[] = [];
        /**
         * FIXME: document.getText() contains unsaved text as well.
         * This is crucial, as the range keeps on changing for the Color Info
         * Not sure why but VScode doesn't provide any Buffer instead of text for
         * huge file content.
         * That means I will have to work upon the entire text all at once.
         */
        const readable = fs.createReadStream(document.uri.fsPath);
        let lineOffset = 0;
        let charOffset = 0;

        readable.on("data", (chunk: Buffer) => {
          const text = chunk.toString();
          const lineDetails = text
            .split(eol)
            .reduce((lineDetails, line, index) => {
              let charOffset = 0;
              if (index > 0) {
                charOffset =
                  lineDetails[index - 1].length +
                  lineDetails[index - 1].charOffset;
              }
              lineDetails.push({
                start: new Position(index + lineOffset, 0),
                charOffset,
                length: line.length + eol.length,
              });
              return lineDetails;
            }, [] as { start: Position; charOffset: number; length: number }[]);

          const matches = text.matchAll(/var\((.*?)\)/g);
          for (const cssVarMatch of matches) {
            const match = cssVarMatch[0];
            const key = cssVarMatch[1];
            if (CACHE.cssVarsMap[key]?.color && cssVarMatch.index) {
              const start = cssVarMatch.index + charOffset;
              const line = lineDetails.find(
                detail =>
                  detail.charOffset <= start &&
                  start < detail.charOffset + detail.length
              );
              if (line) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const color = parseToRgb(
                  CACHE.cssVarsMap[key].color!
                ) as RgbaColor;
                const info = {
                  color: new Color(
                    color.red / 255,
                    color.green / 255,
                    color.blue / 255,
                    color.alpha ? color.alpha / 255 : 1
                  ),
                  range: new Range(
                    line.start.translate({
                      characterDelta: start - line.charOffset,
                    }),
                    line.start.translate({
                      characterDelta: start - line.charOffset + match.length,
                    })
                  ),
                };
                colorInfo.push(info);
              }
            }
          }

          lineOffset = lineDetails.length;
          charOffset = text.length;
        });
        readable.on("end", () => {
          // console.log(">>>> ", colorInfo);
          res(colorInfo);
        });
      });
    });
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
