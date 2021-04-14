import { parseFiles } from "../parser";
import path from "path";
import fs from "fs";
import { Config, DEFAULT_CONFIG, CACHE } from "../constants";
import { CSSVarDeclarations } from "../main";
import flatMap from "lodash/flatMap";

const MODIFIED_DATE = new Date("2021-04-12T08:58:58.676Z");
const DUMMY_FILE = path.resolve("src", "test", "touch.css");
const RENAMED_FILE = path.resolve("src", "test", "renamed.css");
const BROKEN_FILE = path.resolve("src", "test", "broken.css");

jest.mock("../constants", () => {
  const CONSTANTS = jest.requireActual("../constants");
  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      cssVars: {},
      fileMetas: {},
    },
  };
});

const EXTENSION_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  files: [DUMMY_FILE],
};

describe("Test Parser", () => {
  const INIT_STATS = fs.statSync(DUMMY_FILE);
  describe(`parseFiles`, () => {
    beforeEach(async () => {
      fs.utimesSync(DUMMY_FILE, INIT_STATS.atime, MODIFIED_DATE);
      CACHE.cssVars = {};
      CACHE.fileMetas[DUMMY_FILE] = {
        path: DUMMY_FILE,
        lastModified: +MODIFIED_DATE,
      };
    });

    it("Should update cache, if file was modified", async () => {
      fs.utimesSync(
        DUMMY_FILE,
        INIT_STATS.atime,
        new Date(+MODIFIED_DATE + 3600)
      );
      const OLD_CACHE = CACHE.cssVars;
      await parseFiles(EXTENSION_CONFIG);
      expect(Object.keys(CACHE.cssVars).length).toBeGreaterThan(0);
      expect(OLD_CACHE).not.toBe(CACHE.cssVars);
    });

    it("Shouldn't update cache, if file wasn't modified", async () => {
      const OLD_CACHE = CACHE.cssVars;
      await parseFiles(EXTENSION_CONFIG);
      expect(Object.keys(CACHE.cssVars).length).toBe(0);
      expect(OLD_CACHE).toBe(CACHE.cssVars);
    });

    it("Should update cache, if file was renamed", async () => {
      //#region Set some unknown filename, that mocks a deleted filename
      CACHE.fileMetas = {
        "unknown.css": {
          path: "unknown.css",
          lastModified: +MODIFIED_DATE,
        },
      };
      const oldVariable = {
        property: "--red",
        value: "#f00",
        theme: "",
      };
      CACHE.cssVars = {
        "unknown.css": [oldVariable],
      };
      //#endregion
      // Updated config should contain the latest renamed file name.
      const updatedConfig: Config = {
        ...EXTENSION_CONFIG,
        files: [RENAMED_FILE],
      };
      const OLD_VARS = CACHE.cssVars;
      const OLD_FILE_META = Object.keys(CACHE.fileMetas);
      await parseFiles(updatedConfig);
      expect(Object.keys(CACHE.cssVars).length).toBeGreaterThan(0);
      expect(CACHE.cssVars[RENAMED_FILE]).toContainEqual({
        property: "--red500",
        value: "#f24455",
        color: "#f24455",
        theme: "",
      } as CSSVarDeclarations);
      expect(flatMap(CACHE.cssVars)).not.toContainEqual(oldVariable);
      expect(OLD_VARS).not.toBe(CACHE.cssVars);
      expect(OLD_FILE_META.length).toBe(Object.keys(CACHE.fileMetas).length);
      expect(OLD_FILE_META).not.toEqual(Object.keys(CACHE.fileMetas));
    });
  });
  describe("parseFiles handle improper CSS Files", () => {
    it("Should be able to handle few improper CSS files", async () => {
      // Updated config should contain the latest renamed file name.
      const updatedConfig: Config = {
        ...EXTENSION_CONFIG,
        files: [RENAMED_FILE, BROKEN_FILE],
      };
      await parseFiles(updatedConfig);
      expect(Object.keys(CACHE.cssVars).length).toBeGreaterThan(0);
      expect(CACHE.cssVars[RENAMED_FILE][0]).toMatchObject({
        property: "--red100",
        value: "#f00",
      } as CSSVarDeclarations);
      expect(CACHE.cssVars[BROKEN_FILE].length).toBe(0);
    });
  })
});
