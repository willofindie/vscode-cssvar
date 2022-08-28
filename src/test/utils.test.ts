import { Position, Range } from "vscode";
import { SupportedLanguageIds } from "../constants";
import { CSSVarDeclarations } from "../main";
import { normalizeVars, restrictIntellisense } from "../utils";

describe("Utility Function Tests", () => {
  describe(`normalizeVars`, () => {
    it("should return proper rgb string for known Color Names", async () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          type: "css",
          property: "--red500",
          value: "red",
          real: "red",
          theme: "",
        },
      ];
      const result = await normalizeVars(cssVars[0].value, cssVars);
      expect(result.isColor).toBeTruthy();
      expect(result.value).toEqual("rgb(255, 0, 0)");
    });
    it("should return proper rgb string recursively", async () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          type: "css",
          property: "--red500",
          value: "red",
          real: "red",
          theme: "",
        },
        {
          type: "css",
          property: "--bg01",
          value: "var(--red500)",
          real: "var(--red500)",
          theme: "",
        },
      ];
      const result = await normalizeVars(cssVars[1].value, cssVars);
      expect(result.isColor).toBeTruthy();
      expect(result.value).toEqual("rgb(255, 0, 0)");
    });
    it("should not return color if value is not a color", async () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          type: "css",
          property: "--pad-1",
          value: "16px",
          real: "16px",
          theme: "",
        },
        {
          type: "css",
          property: "--spacing-x",
          value: "var(--pad-1)",
          real: "var(--pad-1)",
          theme: "",
        },
      ];
      const result = await normalizeVars(cssVars[1].value, cssVars);
      expect(result.isColor).toBeFalsy();
      expect(result.value).toEqual("16px");
    });
  });

  it("should parse variables passed inside CSS functions", async () => {
    const cssVars: CSSVarDeclarations[] = [
      {
        type: "css",
        property: "--color",
        value: "210 14% 89%",
        real: "210 14% 89%",
        theme: "",
      },
      {
        type: "css",
        property: "--g-rot",
        value: "45deg",
        real: "45deg",
        theme: "",
      },
      {
        type: "css",
        property: "--g-red",
        value: "red",
        real: "red",
        theme: "",
      },
      {
        type: "css",
        property: "--test",
        value: "14% 89% / 30%",
        real: "14% 89% / 30%",
        theme: "",
      },
      {
        type: "css",
        property: "--color-solid",
        value: "hsl(var(--color))",
        real: "hsl(var(--color))",
        theme: "",
      },
      {
        type: "css",
        property: "--color-translucent",
        value: "hsla(var(--color) / 30%)",
        real: "hsla(var(--color) / 30%)",
        theme: "",
      },
      {
        type: "css",
        property: "--color-deg",
        value: "hsla(var(--g-rot) var(--test))",
        real: "hsla(var(--g-rot) var(--test))",
        theme: "",
      },
      {
        type: "css",
        property: "--color-gradient",
        value: "linear-gradient(var(--g-rot), var(--g-red), var(--color-translucent))",
        real: "linear-gradient(var(--g-rot), var(--g-red), var(--color-translucent))",
        theme: "",
      },
    ];
    const result1 = await normalizeVars(cssVars[4].value, cssVars);
    const result2 = await normalizeVars(cssVars[5].value, cssVars);
    const result3 = await normalizeVars(cssVars[6].value, cssVars);
    const result4 = await normalizeVars(cssVars[7].value, cssVars);
    // Following tests color var parsing for only single argument
    expect(result1.isColor).toBeTruthy();
    expect(result1.value).toEqual("rgb(223, 227, 231)");
    // Following tests color var parsing with divider
    expect(result2.isColor).toBeTruthy();
    expect(result2.value).toEqual("rgba(223, 227, 231, 0.3)");
    // Following tests color var parsing without divider
    expect(result3.isColor).toBeTruthy();
    expect(result3.value).toEqual("rgba(231, 229, 223, 0.3)");
    // As of now recursively finding var(--color) details only for Color Functions.
    expect(result4.isColor).toBeFalsy();
    expect(result4.value).toEqual(cssVars[7].value);
  });

  it("should parse CSS functions without variables", async () => {
    const cssVars: CSSVarDeclarations[] = [
      {
        type: "css",
        property: "--color-hex",
        value: "#6A1B9A",
        real: "#6A1B9A",
        theme: "",
      },
      {
        type: "css",
        property: "--color-rgb",
        value: "rgb(106, 27, .154e+3)",
        real: "rgb(106, 27, .154e+3)",
        theme: "",
      },
      {
        type: "css",
        property: "--color-hsl",
        value: "hsl(27732e-2, 70.17%, 35.49%)",
        real: "hsl(27732e-2, 70.17%, 35.49%)",
        theme: "",
      },
      {
        type: "css",
        property: "--color-hwba",
        value: "hwb(277.3228 10.588% 39.6078%)",
        real: "hwb(277.3228 10.588% 39.6078%)",
        theme: "",
      },

      // With Alpha
      {
        type: "css",
        property: "--color-hex8",
        value: "#6A1B9Aaa",
        real: "#6A1B9Aaa",
        theme: "",
      },
      {
        type: "css",
        property: "--color-rgba",
        value: "rgba(106, 27, 154, 0.67)",
        real: "rgba(106, 27, 154, 0.67)",
        theme: "",
      },
      {
        type: "css",
        property: "--color-hsla",
        value: "hsla(277.32, 70.17%, 35.49%, .67)",
        real: "hsla(277.32, 70.17%, 35.49%, .67)",
        theme: "",
      },
      {
        type: "css",
        property: "--color-hwba",
        value: "hwb(277.3228 10.588% 39.6078% / .67)",
        real: "hwb(277.3228 10.588% 39.6078% / .67)",
        theme: "",
      },
    ];
    const colorWithNegativeRad = [{
      type: "css",
      property: "--color",
      value: "hwb(-100 0% 10%)",
      theme: "",
    }] as CSSVarDeclarations[];

    const results = await Promise.all(cssVars.map(cssVar => normalizeVars(cssVar.value, cssVars)));
    const maxIndexWithoutAlpha = Math.ceil((results.length / 2) - 1);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      expect(result.isColor).toBeTruthy();
      if (i <= maxIndexWithoutAlpha) {
        expect(result.value).toEqual("rgb(106, 27, 154)");
      } else {
        expect(result.value).toEqual("rgba(106, 27, 154, 0.67)");
      }
    }

    const result = await normalizeVars(colorWithNegativeRad[0].value, colorWithNegativeRad);
    expect(result.isColor).toBeTruthy();
    expect(result.value).toEqual("rgb(76, 0, 230)");
  });

  describe(`restrictIntellisense`, () => {
    it("should return empty array for wrong activation in JS files", () => {
      const input1 = "for(let i=4; i>0; --i) {}";
      const input2 = "let x = --i";
      const input3 = "--i";
      // Need to fix intellisense getting triggered for input4 for JS like files.
      const input4 = '{x: "(--i) reduces i by 1"';
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
