import { resolve } from "path";
import { JS_BLOCK } from "../../pre-processors";
import { parseFiles } from "../../parser";
import { CACHE, Config, CSSVarRecord, DEFAULT_CONFIG } from "../../constants";
import { getLocalCSSVarLocation } from "../test-utilities";

jest.mock("../../constants", () => {
  const CONSTANTS = jest.requireActual("../../constants");
  const activeRootPath = "foo";
  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      activeRootPath,
      config: { [activeRootPath]: CONSTANTS.DEFAULT_CONFIG },
    },
  };
});

type ConfigRecord = { [rootPath: string]: Config };

const MODIFIED_DATE = new Date("2021-04-12T08:58:58.676Z");
const JSX_FILE_PATH = resolve(__dirname, "..", "fixtures", "edge-cases.jsx");
const MOCK_CONFIG: ConfigRecord = {
  [CACHE.activeRootPath]: {
    ...DEFAULT_CONFIG,
    files: [getLocalCSSVarLocation(JSX_FILE_PATH)],
  },
};

const RESULTS = [
  {
    type: "css",
    property: "--h1",
    value: "44px",
    theme: "",
  },
  {
    type: "css",
    property: "--h2",
    value: "32px",
    theme: "",
  },
  {
    type: "css",
    property: "--h3",
    value: "24px",
    theme: "",
  },
  {
    type: "css",
    property: "--color-red",
    value: "red",
    theme: "",
    color: "rgb(255, 0, 0)",
  },
  {
    type: "css",
    property: "--color-green",
    value: "green",
    theme: "",
    color: "rgb(0, 128, 0)",
  },
  {
    type: "css",
    property: "--color-blue",
    value: "blue",
    theme: "",
    color: "rgb(0, 0, 255)",
  },
  {
    type: "css",
    property: "--base-var-1",
    value: "#333",
    theme: "",
    color: "rgb(51, 51, 51)",
  },
  {
    type: "css",
    property: "--child-var-1",
    value: "#222",
    theme: "",
    color: "rgb(34, 34, 34)",
  },

  // This should belong in WRONG_RESULTS, but for now
  // it's fine
  {
    type: "css",
    property: "--random",
    value: "error",
    theme: "",
  },
];

const WRONG_RESULTS = [
  {
    type: "css",
    property: "--",
    value: JS_BLOCK,
  },
  {
    type: "css",
    property: "--fuzz",
    value: JS_BLOCK,
  },
  {
    type: "css",
    property: "--flex",
  },
  {
    type: "css",
    property: "--baz",
  },
];

let globalVarRecord: CSSVarRecord;
beforeAll(() => {
  CACHE.filesToWatch[CACHE.activeRootPath] = new Set();
  CACHE.fileMetas = {};
  CACHE.fileMetas[JSX_FILE_PATH] = {
    path: JSX_FILE_PATH,
    lastModified: +MODIFIED_DATE,
  };
  return parseFiles(MOCK_CONFIG).then(([varRecord, _]) => {
    globalVarRecord = varRecord;
    return varRecord;
  });
});

test("should have proper variables present", () => {
  for (const result of RESULTS) {
    expect(globalVarRecord[JSX_FILE_PATH]).toContainEqual(expect.objectContaining(result));
  }
});

test("should not have improper variables", () => {
  for (const wrong of WRONG_RESULTS) {
    expect(globalVarRecord[JSX_FILE_PATH]).not.toContainEqual(expect.objectContaining(wrong));
  }
});
