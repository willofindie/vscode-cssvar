import { Position, Range } from "vscode";
import { SupportedLanguageIds } from "../constants";
import { CSSVarDeclarations } from "../main";
import { getColor, restrictIntellisense } from "../utils";

describe("Utility Function Tests", () => {
  describe(`getColor`, () => {
    it("should return proper Hex string for unknown Color Names", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--red500",
          value: "red",
          theme: "",
        },
      ];
      const result = getColor(cssVars[0].value, cssVars);
      expect(result.success).toBeTruthy();
      expect(result.color).toEqual("#f00");
    });
    it("should return proper Hex string recursively", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--red500",
          value: "red",
          theme: "",
        },
        {
          property: "--bg01",
          value: "var(--red500)",
          theme: "",
        },
      ];
      const result = getColor(cssVars[1].value, cssVars);
      expect(result.success).toBeTruthy();
      expect(result.color).toEqual("#f00");
    });
    it("should not return color if value is not a color", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--pad-1",
          value: "16px",
          theme: "",
        },
        {
          property: "--spacing-x",
          value: "var(--pad-1)",
          theme: "",
        },
      ];
      const result = getColor(cssVars[1].value, cssVars);
      expect(result.success).toBeFalsy();
      expect(result.color).toEqual("");
    });
  });

  describe(`restrictIntellisense`, () => {
    it("should return empty array for wrong activation in JS files", () => {
      const input1 = "for(let i=4; i>0; --i) {}";
      const input2 = "let x = --i";
      const input3 = "--i";
      const result1 = restrictIntellisense(
        input1,
        "javascript",
        new Range(new Position(0, 0), new Position(0, input1.length))
      );
      const result2 = restrictIntellisense(
        input2,
        "javascript",
        new Range(new Position(0, 0), new Position(0, input2.length))
      );
      const result3 = restrictIntellisense(
        input3,
        "javascript",
        new Range(new Position(0, 0), new Position(0, input3.length))
      );
      expect(result1.length).toBe(0);
      expect(result2.length).toBe(0);
      expect(result3.length).toBe(0);
    });

    const initCount = 8;
    it("should not restrict for proper css variable use in CSS", () => {
      const last = 4;
      const lines = [
        "  color: -",
        "  color: --",
        "  border-radius: --c",
        "  color: linear-gradient(45deg, --v);",
        "  color: var(--color1) --c",
      ];
      const positions = [
        [initCount + 1, initCount + 1],
        [initCount + 1, initCount + 2],
        [initCount + 9, initCount + 11],
        [initCount + 24, initCount + 26],
        [initCount + 15, initCount + 17],
      ]
      const results = lines.map(line => restrictIntellisense(
        line,
        "css",
        new Range(new Position(0, 0), new Position(0, line.length))
      ));
      for (const index in positions.slice(0, positions.length - 1)) {
        const position = positions[index];
        expect(results[index][0]).toMatchObject({
          range: {
            start: expect.objectContaining({
              character: position[0],
            }),
            end: expect.objectContaining({
              character: position[1]
            }),
          }
        });
      }
      expect(results[last].length).toBe(2);
      expect(results[last][1]).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: positions[last][0],
          }),
          end: expect.objectContaining({
            character: positions[last][1]
          }),
        }
      });
    })

    it("should not restrict for proper css variable used in JS", () => {
      const last = 4;
      const lines = [
        "  color: -",
        "  color: '--c'",
        "  color: `--c`",
        "  color: linear-gradient(45deg, --v);",
        "  color: var(--color1) --c",
      ];
      const positions = [
        [initCount + 1, initCount + 1],
        [initCount + 2, initCount + 4],
        [initCount + 2, initCount + 4],
        [initCount + 24, initCount + 26],
        [initCount + 15, initCount + 17],
      ]
      const results = lines.map(line => restrictIntellisense(
        line,
        "javascriptreact",
        new Range(new Position(0, 0), new Position(0, line.length))
      ));
      expect(results[0].length).toBe(0); // Since we activate only after second `-`
      const test_results = results.slice(1, results.length - 1);
      const test_positions = positions.slice(1, positions.length - 1);
      for (const index in test_positions) {
        const position = test_positions[index];
        expect(test_results[index][0]).toMatchObject({
          range: {
            start: expect.objectContaining({
              character: position[0],
            }),
            end: expect.objectContaining({
              character: position[1]
            }),
          }
        });
      }
      expect(results[last].length).toBe(2);
      expect(results[last][1]).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: positions[last][0],
          }),
          end: expect.objectContaining({
            character: positions[last][1]
          }),
        }
      });
    })

    it("should return proper range", () => {
      const lines: [string, SupportedLanguageIds][] = [
        ["  color: var(-);", "css"],
        ["  let color = 'var(--b)'", "javascriptreact"],
        ["  { color: 'var(--b' }", "javascriptreact"],
        ["  border-radius: --c;", "css"],
      ];

      const [r1, r2, r3, r4] = lines.map(([line, lang]) => restrictIntellisense(
        line,
        lang,
        new Range(new Position(0, 0), new Position(0, line.length))
      ));

      expect(r1[0]).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 13,
          }),
          end: expect.objectContaining({
            character: 13
          }),
        },
        insideVar: true,
        suffixChar: ")",
      });
      expect(r2.length).toBe(0); // It get's tricky if we support variable instantiation in JS as well
      expect(r3[0]).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 16,
          }),
          end: expect.objectContaining({
            character: 18
          }),
        },
        insideVar: true,
        suffixChar: "'",
      });
      expect(r4[0]).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 17,
          }),
          end: expect.objectContaining({
            character: 19
          }),
        },
        insideVar: false,
        suffixChar: ";",
      });
    });
  });
});
