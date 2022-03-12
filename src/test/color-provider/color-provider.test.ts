import { EndOfLine, TextDocument } from "vscode";
import { parseToRgb } from "../../color-parser";

import { CssColorProvider } from "../../color-provider";
import { CSSVarDeclarations } from "../../main";

jest.mock("../../constants", () => {
  const CONSTANTS = jest.requireActual("../../constants");
  const VARIABLES_FILE = "path";
  const cssVariables = [
    {
      property: "--color-red-300",
      value: "#fc8181",
      color: "#fc8181",
    } as CSSVarDeclarations,
    {
      property: "--color-red-500",
      value: "#e53e3e",
      color: "#e53e3e",
    } as CSSVarDeclarations,
    {
      property: "--color-red-700",
      value: "#c53030",
      color: "#c53030",
    } as CSSVarDeclarations,
  ];

  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      cssVars: { [VARIABLES_FILE]: cssVariables },
      cssVarsMap: cssVariables.reduce(
        (map, css) => ({ ...map, [css.property]: css }),
        {}
      ),
      config: {
        ...CONSTANTS.DEFAULT_CONFIG,
        files: [VARIABLES_FILE],
      },
    },
  };
});

jest.mock("../../main", () => {
  return {
    __esModule: true,
    setup: jest.fn().mockResolvedValue({}),
  };
});

jest.mock("../../parser", () => {
  return {
    __esModule: true,
    parseFiles: jest.fn().mockResolvedValue([]),
  };
});

const getDocumentFromText = (text: string) => {
  let called = false;
  return {
    eol: EndOfLine.LF,
    getText() {
      if (!called) {
        called = true;
        return `${text}\n\n`;
      }
      return null;
    },
  } as TextDocument
};

describe("Test Color Provider", () => {
  let provider: CssColorProvider;
  const red300 = parseToRgb("#fc8181");
  const red500 = parseToRgb("#e53e3e");

  beforeAll(() => {
    provider = new CssColorProvider();
  });

  it("should provide color for single var()", async () => {
    const colorInfos = await provider.provideDocumentColors(
      getDocumentFromText("color: var(--color-red-300)")
    );
    expect(colorInfos.length).toBe(1);
    expect(colorInfos[0].color).toMatchObject({
      red: red300!.r,
      green: red300!.g,
      blue: red300!.b,
      alpha: red300!.alpha ?? 1,
    });
    expect(colorInfos[0].range.start.character).toBe(7);
    expect(colorInfos[0].range.end.character).toBe(27);
  });
  it("should provide color for multi-line var()", async () => {
    const colorInfos = await provider.provideDocumentColors(
      getDocumentFromText("color: var(--color-red-300)\ncolor: var(--color-red-500)\ncolor: var(--color-red-700)")
    );
    expect(colorInfos.length).toBe(3);
    expect(colorInfos[1].color).toMatchObject({
      red: red500!.r,
      green: red500!.g,
      blue: red500!.b,
      alpha: red500!.alpha ?? 1,
    });
    expect(colorInfos[1].range).toEqual(
      expect.objectContaining({
        start: expect.objectContaining({
          line: 1,
          character: 7
        }),
        end: expect.objectContaining({
          line: 1,
          character: 27
        })
      })
    );
  });
});
