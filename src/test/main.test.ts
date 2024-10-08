import { Position, Range, workspace } from "vscode";
import { Config, CSSVarRecord, DEFAULT_CONFIG, CACHE } from "../constants";
import { createCompletionItems } from "../main";
import { Region } from "../utils";
import { getLocalCSSVarLocation } from "./test-utilities";

jest.mock("../constants", () => ({
  ...jest.requireActual("../constants"),
  UNSTABLE_FEATURES: {
    no_sort: true,
  },
}));

let region: Region | null = null;
const DEFAULT_ROOT_FOLDER = "test";

beforeEach(() => {
  CACHE.activeRootPath = DEFAULT_ROOT_FOLDER;
  CACHE.config = {
    [CACHE.activeRootPath]: {
      ...DEFAULT_CONFIG,
      files: [
        {
          local: "",
          remote: "",
          isRemote: false,
        },
      ],
      postcssPlugins: [],
      postcssSyntax: {},
      mode: ["off", {}],
      disableSort: false,
    },
  } as Record<string, Config>;
});

beforeAll(() => {
  // @ts-expect-error Readonly property
  workspace.workspaceFolders = [
    {
      uri: {
        path: DEFAULT_ROOT_FOLDER,
        fsPath: DEFAULT_ROOT_FOLDER,
      },
    },
  ];
});

afterAll(() => {
  // @ts-expect-error Readonly property
  workspace.workspaceFolders = [];
});

describe("Test Extension Main", () => {
  beforeEach(() => {
    region = {
      range: new Range(new Position(0, 5), new Position(0, 10)),
      insideVar: false,
      suffixChar: "",
    } as Region;
  });

  describe(`Test createCompletion method`, () => {
    it("Should return CompletionItems with Sorting On", async () => {
      const config: Config = {
        ...DEFAULT_CONFIG,
        files: [
          {
            local: "",
            remote: "",
            isRemote: false,
          },
        ],
        postcssPlugins: [],
        postcssSyntax: {},
        mode: ["off", {}],
        disableSort: false,
      };
      const cssVars: CSSVarRecord = {
        "./src/01.css": [
          {
            type: "css",
            property: "--red-A100",
            value: "red",
            real: "red",
            theme: "",
          },
        ],
        "./src/02.css": [
          {
            type: "css",
            property: "--red-500",
            value: "red",
            real: "red",
            theme: "",
          },
        ],
      };
      const items = createCompletionItems(config, cssVars, {
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
      const config: Config = {
        ...DEFAULT_CONFIG,
        files: [
          {
            local: "",
            remote: "",
            isRemote: false,
          },
        ],
        postcssPlugins: [],
        postcssSyntax: {},
        mode: ["off", {}],
        disableSort: true,
      };
      const cssVars: CSSVarRecord = {
        "./src/01.css": [
          {
            type: "css",
            property: "--red-A100",
            value: "red",
            real: "red",
            theme: "",
          },
        ],
        "./src/02.css": [
          {
            type: "css",
            property: "--red-500",
            value: "red",
            real: "red",
            theme: "",
          },
        ],
      };

      const items = createCompletionItems(config, cssVars, {
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
      const config: Config = {
        ...DEFAULT_CONFIG,
        files: [getLocalCSSVarLocation("")],
        postcssPlugins: [],
        postcssSyntax: {},
        mode: ["off", {}],
        disableSort: true,
      };
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

      const items1 = createCompletionItems(config, cssVars1, {
        region,
        languageId: "css",
      });
      const items2 = createCompletionItems(config, cssVars2, {
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
