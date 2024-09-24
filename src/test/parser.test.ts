import { parseFiles } from "../parser";
import path from "path";
import { workspace } from "vscode";
import fs from "fs";
import { Config, DEFAULT_CONFIG, CACHE } from "../constants";
import { CSSVarDeclarations } from "../main";
import flatMap from "lodash/flatMap";
import { getLocalCSSVarLocation } from "./test-utilities";
import { fetchAndCacheAsset } from "../remote-paths";

const MODIFIED_DATE = new Date("2021-04-12T08:58:58.676Z");
const DUMMY_FILE = path.resolve("src", "test", "touch.css");
const RENAMED_FILE = path.resolve("src", "test", "renamed.css");
const AT_RULES_CSS = path.resolve("src", "test", "at-rules.css");
const BROKEN_FILE = path.resolve("src", "test", "broken.css");
const IMPORT_BASE = path.resolve("src", "test", "css-imports");
const IMPORT_CSS_FILE = path.resolve(IMPORT_BASE, "import.css");
const IMPORT_SCSS_FILE = path.resolve(IMPORT_BASE, "import.scss");

jest.mock("../constants", () => {
  const CONSTANTS = jest.requireActual("../constants");
  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      activeRootPath: "test",
      config: { test: CONSTANTS.DEFAULT_CONFIG },
    },
  };
});

jest.mock("../remote-paths");

type ConfigRecord = { [rootFolder: string]: Config };

const EXTENSION_CONFIG: ConfigRecord = {
  [CACHE.activeRootPath]: {
    ...DEFAULT_CONFIG,
    files: [getLocalCSSVarLocation(DUMMY_FILE)],
    mode: ["off", {}],
    postcssPlugins: [],
    postcssSyntax: {},
  },
};

describe("Test Parser", () => {
  const INIT_STATS = fs.statSync(DUMMY_FILE);
  beforeEach(() => {
    fs.utimesSync(DUMMY_FILE, INIT_STATS.atime, MODIFIED_DATE);
    CACHE.cssVars = { [CACHE.activeRootPath]: {} };
    CACHE.filesToWatch[CACHE.activeRootPath] = new Set();
    CACHE.fileMetas = {};
    CACHE.fileMetas[DUMMY_FILE] = {
      path: DUMMY_FILE,
      lastModified: +MODIFIED_DATE,
    };
  });
  describe(`parseFiles`, () => {
    it("Should update cache, if file was modified", async () => {
      fs.utimesSync(
        DUMMY_FILE,
        INIT_STATS.atime,
        new Date(+MODIFIED_DATE + 3600)
      );
      const OLD_CACHE = CACHE.cssVars[CACHE.activeRootPath];
      await parseFiles(EXTENSION_CONFIG);
      expect(
        Object.keys(CACHE.cssVars[CACHE.activeRootPath]).length
      ).toBeGreaterThan(0);
      expect(OLD_CACHE[CACHE.activeRootPath]).not.toBe(
        CACHE.cssVars[CACHE.activeRootPath]
      );
    });

    it("Shouldn't update cache, if file wasn't modified", async () => {
      const OLD_CACHE = CACHE.cssVars[CACHE.activeRootPath];
      await parseFiles(EXTENSION_CONFIG);
      expect(Object.keys(CACHE.cssVars[CACHE.activeRootPath]).length).toBe(0);
      expect(OLD_CACHE).toBe(CACHE.cssVars[CACHE.activeRootPath]);
    });

    it("Should update cache, if file was renamed", async () => {
      //#region Set some unknown filename, that mocks a deleted filename
      CACHE.fileMetas = {
        "unknown.css": {
          path: "unknown.css",
          lastModified: +MODIFIED_DATE,
        },
      };
      const oldVariable: CSSVarDeclarations = {
        type: "css",
        property: "--red",
        value: "rgb(255, 0, 0)",
        real: "rgb(255, 0, 0)",
        theme: "",
      };
      CACHE.cssVars = {
        [CACHE.activeRootPath]: {
          "unknown.css": [oldVariable],
        },
      };
      //#endregion
      // Updated config should contain the latest renamed file name.
      const updatedConfig: ConfigRecord = {
        [CACHE.activeRootPath]: {
          ...EXTENSION_CONFIG[CACHE.activeRootPath],
          files: [getLocalCSSVarLocation(RENAMED_FILE)],
        },
      };
      const OLD_VARS = CACHE.cssVars[CACHE.activeRootPath];
      const OLD_FILE_META = Object.keys(CACHE.fileMetas);
      await parseFiles(updatedConfig);
      expect(
        Object.keys(CACHE.cssVars[CACHE.activeRootPath]).length
      ).toBeGreaterThan(0);
      expect(CACHE.cssVars[CACHE.activeRootPath][RENAMED_FILE]).toContainEqual({
        type: "css",
        property: "--red500",
        value: "#f24455",
        real: "#f24455",
        color: "rgb(242, 68, 85)",
        theme: "",
        location: expect.objectContaining({
          uri: RENAMED_FILE,
        }),
      } as CSSVarDeclarations);
      expect(flatMap(CACHE.cssVars[CACHE.activeRootPath])).not.toContainEqual(
        oldVariable
      );
      expect(OLD_VARS).not.toBe(CACHE.cssVars[CACHE.activeRootPath]);
      expect(OLD_FILE_META.length).toBe(Object.keys(CACHE.fileMetas).length);
      expect(OLD_FILE_META).not.toEqual(Object.keys(CACHE.fileMetas));
    });

    it("Should call remote URLs only once", async () => {
      // Updated config should contain the latest renamed file name.
      const updatedConfig: ConfigRecord = {
        [CACHE.activeRootPath]: {
          ...EXTENSION_CONFIG[CACHE.activeRootPath],
          files: [
            {
              local: path.resolve(__dirname, "fixtures/theming.css"), // Does nothing, just to make jest happy
              remote: "http://example.com/v0.12.3/foo.css",
              isRemote: true,
            },
          ],
        },
      };

      await parseFiles(updatedConfig);
      expect(fetchAndCacheAsset).toHaveBeenCalledTimes(1);
      jest.resetAllMocks();
      await parseFiles(updatedConfig);
      expect(fetchAndCacheAsset).toHaveBeenCalledTimes(0);
    });

    it("Should parse at-rules", async () => {
      // Updated config should contain the latest renamed file name.
      const updatedConfig: ConfigRecord = {
        [CACHE.activeRootPath]: {
          ...EXTENSION_CONFIG[CACHE.activeRootPath],
          files: [getLocalCSSVarLocation(AT_RULES_CSS)],
        },
      };
      CACHE.config = updatedConfig;
      const [, errorPaths] = await parseFiles(updatedConfig);
      expect(errorPaths.length).toBe(0);
    });
  });

  describe("parseFiles handle improper CSS Files", () => {
    it("Should be able to handle few improper CSS files", async () => {
      // Updated config should contain the latest renamed file name.
      const updatedConfig: ConfigRecord = {
        [CACHE.activeRootPath]: {
          ...EXTENSION_CONFIG[CACHE.activeRootPath],
          files: [
            getLocalCSSVarLocation(RENAMED_FILE),
            getLocalCSSVarLocation(BROKEN_FILE),
          ],
        },
      };
      CACHE.config = updatedConfig;
      const [, errorPaths] = await parseFiles(updatedConfig);
      expect(
        Object.keys(CACHE.cssVars[CACHE.activeRootPath]).length
      ).toBeGreaterThan(0);
      expect(
        CACHE.cssVars[CACHE.activeRootPath][RENAMED_FILE][0]
      ).toMatchObject({
        type: "css",
        property: "--red100",
        value: "#f00",
      } as CSSVarDeclarations);
      expect(CACHE.cssVars[CACHE.activeRootPath][BROKEN_FILE].length).toBe(0);
      expect(errorPaths.length).toBe(0);
    });
  });

  it(`parse css imports`, async () => {
    const cssConfig: ConfigRecord = {
      [CACHE.activeRootPath]: {
        ...EXTENSION_CONFIG[CACHE.activeRootPath],
        files: [getLocalCSSVarLocation(IMPORT_CSS_FILE)],
      },
    };
    CACHE.config = cssConfig;
    const [, errorPaths] = await parseFiles(cssConfig);
    expect(CACHE.filesToWatch[CACHE.activeRootPath].size).toBe(6);
    expect(Array.from(CACHE.filesToWatch[CACHE.activeRootPath])).toEqual(
      expect.arrayContaining([
        path.resolve(IMPORT_BASE, "f1.css"),
        path.resolve(IMPORT_BASE, "f3.css"),
        RENAMED_FILE,
      ])
    );
    expect(errorPaths.length).toBe(0);
  });
  it(`parse scss imports`, async () => {
    const scssConfig: ConfigRecord = {
      [CACHE.activeRootPath]: {
        ...EXTENSION_CONFIG[CACHE.activeRootPath],
        files: [getLocalCSSVarLocation(IMPORT_SCSS_FILE)],
      },
    };
    CACHE.config = scssConfig;
    const [, errorPaths] = await parseFiles(scssConfig);
    expect(CACHE.filesToWatch[CACHE.activeRootPath].size).toBe(7);
    expect(Array.from(CACHE.filesToWatch[CACHE.activeRootPath])).toEqual(
      expect.arrayContaining([
        path.resolve(IMPORT_BASE, "f1.scss"),
        path.resolve(IMPORT_BASE, "_f3.scss"),
        path.resolve(IMPORT_BASE, "nested", "_f5.scss"),
        path.resolve(IMPORT_BASE, "nested", "f6.scss"),
      ])
    );
    expect(errorPaths.length).toBe(0);
  });
});

describe("Multi Root", () => {
  const rootPath1 = "test-1";
  const rootPath2 = "test-2";

  beforeEach(() => {
    CACHE.filesToWatch = {};
    CACHE.fileMetas = {};
  });

  beforeAll(() => {
    // @ts-expect-error readonly property
    workspace.workspaceFolders = [
      {
        uri: {
          path: rootPath1,
          fsPath: rootPath1,
        },
      },
      {
        uri: {
          path: rootPath2,
          fsPath: rootPath2,
        },
      },
    ];
  });

  afterAll(() => {
    // @ts-expect-error readonly property
    workspace.workspaceFolders = [];
  });

  it(`should have proper values for each root folder`, async () => {
    const config: ConfigRecord = {
      [rootPath1]: {
        // This config will test SCSS files
        ...DEFAULT_CONFIG,
        files: [getLocalCSSVarLocation(IMPORT_SCSS_FILE)],
        mode: ["off", {}],
        postcssPlugins: [],
        postcssSyntax: {},
      },
      [rootPath2]: {
        // This config will test SCSS files
        ...DEFAULT_CONFIG,
        files: [getLocalCSSVarLocation(RENAMED_FILE)],
        mode: ["off", {}],
        postcssPlugins: [],
        postcssSyntax: {},
      },
    };
    CACHE.config = config;
    const [, errorPaths] = await parseFiles(config, { parseAll: true });
    expect(CACHE.filesToWatch[rootPath1].size).toBe(7);
    expect(CACHE.filesToWatch[rootPath2].size).toBe(1);

    expect(CACHE.cssVars[rootPath1][IMPORT_SCSS_FILE]).toContainEqual({
      type: "css",
      property: "--test-var",
      value: "#333",
      real: "#333",
      color: "rgb(51, 51, 51)",
      theme: "",
      location: expect.objectContaining({
        uri: IMPORT_SCSS_FILE,
      }),
    } as CSSVarDeclarations);
    expect(CACHE.cssVars[rootPath2][RENAMED_FILE]).toContainEqual({
      type: "css",
      property: "--red500",
      value: "#f24455",
      real: "#f24455",
      color: "rgb(242, 68, 85)",
      theme: "",
      location: expect.objectContaining({
        uri: RENAMED_FILE,
      }),
    } as CSSVarDeclarations);

    expect(errorPaths.length).toBe(0);
  });
});
