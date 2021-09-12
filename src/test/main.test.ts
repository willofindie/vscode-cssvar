import { Position, Range } from "vscode";
import { CSSVarRecord, UNSTABLE_FEATURES } from "../constants";
import { createCompletionItems, getRegion, Region } from "../main";

jest.mock("../constants", () => ({
  ...jest.requireActual("../constants"),
  UNSTABLE_FEATURES: {
    no_sort: true,
  },
}));

let region: Region | null = null;

describe("Test Extension Main", () => {
  beforeEach(() => {
    region = getRegion(
      "color: --s",
      new Range(new Position(0, 5), new Position(0, 10))
    );
  });

  describe(`Test getRegion method`, () => {
    it("testing range for plain -- init", () => {
      const lines = [
        "  color: -",
        "  color: --",
        "  color: --c"
      ];
      let [r1, r2, r3] = lines.map(line => getRegion(
        line,
        new Range(new Position(0, 0), new Position(0, line.length))
      ));
      expect(r1).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 9,
          }),
          end: expect.objectContaining({
            character: 10
          }),
        }
      });
      expect(r2).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 9,
          }),
          end: expect.objectContaining({
            character: 11
          }),
        }
      });
      expect(r3).toMatchObject({
        insideVar: false,
        suffixChar: "c",
        range: {
          start: expect.objectContaining({
            character: 9,
          }),
          end: expect.objectContaining({
            character: 12
          }),
        }
      });
    });
    it("testing range for cssvar init with `var`", () => {
      const linesWithVar = [
        "  color: var(-);",
        "  color: var(--);",
        "  color: var(--c);",
      ];
      let [r1, r2, r3] = linesWithVar.map(line => getRegion(
        line,
        new Range(new Position(0, 0), new Position(0, line.length))
      ));
      expect(r1).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 13,
          }),
          end: expect.objectContaining({
            character: 14
          }),
        }
      });
      expect(r2).toMatchObject({
        range: {
          start: expect.objectContaining({
            character: 13,
          }),
          end: expect.objectContaining({
            character: 15
          }),
        }
      });
      expect(r3).toMatchObject({
        insideVar: true,
        suffixChar: ";",
        range: {
          start: expect.objectContaining({
            character: 13,
          }),
          end: expect.objectContaining({
            character: 16
          }),
        }
      });
    });
  });

  describe(`Test createCompletion method`, () => {
    it("Should return CompletionItems with Sorting On", async () => {
      UNSTABLE_FEATURES.no_sort = false;
      const cssVars: CSSVarRecord = {
        "./src/01.css": [
          {
            property: "--red-A100",
            value: "red",
            theme: "",
          },
        ],
        "./src/02.css": [
          {
            property: "--red-500",
            value: "red",
            theme: "",
          },
        ],
      };
      const items = createCompletionItems(cssVars, {
        region,
        languageId: "css",
      });
      expect(items[0]).not.toHaveProperty("sortText");
      expect(items[0]).toEqual(
        expect.objectContaining({
          insertText: "var(--red-A100);",
        })
      );
    });
    it("Should return CompletionItems with Sorting Disabled", async () => {
      UNSTABLE_FEATURES.no_sort = true;
      const cssVars: CSSVarRecord = {
        "./src/01.css": [
          {
            property: "--red-A100",
            value: "red",
            theme: "",
          },
        ],
        "./src/02.css": [
          {
            property: "--red-500",
            value: "red",
            theme: "",
          },
        ],
      };

      const items = createCompletionItems(cssVars, {
        region,
        languageId: "css",
      });
      expect(items[1]).toMatchObject({
        detail: "Value: red",
        documentation: "red",
        kind: 5,
        label: "--red-500",
        insertText: "var(--red-500);",
        sortText: "1",
      });
    });
    it("Should return CompletionItems with 3 and 2digit sortText", async () => {
      UNSTABLE_FEATURES.no_sort = true;
      const cssVars1: CSSVarRecord = Array(11)
        .fill([
          {
            property: "--red-A100",
            value: "red",
            theme: "",
          },
        ])
        .reduce((acc, item, index) => {
          acc[`./src/${index}.css`] = item;
          return acc;
        }, {});
      const cssVars2: CSSVarRecord = Array(101)
        .fill([
          {
            property: "--red-A100",
            value: "red",
            theme: "",
          },
        ])
        .reduce((acc, item, index) => {
          acc[`./src/${index}.css`] = item;
          return acc;
        }, {});

      const items1 = createCompletionItems(cssVars1, {
        region,
        languageId: "css",
      });
      const items2 = createCompletionItems(cssVars2, {
        region,
        languageId: "css",
      });
      expect(items1[10]).toMatchObject({
        detail: "Value: red",
        documentation: "red",
        kind: 5,
        label: "--red-A100",
        sortText: "10",
      });
      expect(items1[9]).toEqual(
        expect.objectContaining({
          sortText: "09",
        })
      );
      expect(items2[99]).toEqual(
        expect.objectContaining({
          sortText: "099",
        })
      );
      expect(items2[100]).toEqual(
        expect.objectContaining({
          sortText: "100",
        })
      );
    });
  });
});
