import { workspace } from "vscode";
import {
  DEFAULT_CONFIG,
  CACHE,
  WorkspaceConfig,
} from "../constants";
import { setup } from "../main";

jest.mock("../constants", () => ({
  ...jest.requireActual("../constants"),
  UNSTABLE_FEATURES: {
    no_sort: true,
  },
}));

const DEFAULT_ROOT_FOLDER = "test";
const wcGet = jest.fn();
const wcHas = jest.fn();

beforeEach(() => {
  CACHE.activeRootPath = DEFAULT_ROOT_FOLDER;
  CACHE.tmpDir = "foo";
  CACHE.config = {};
  wcGet.mockClear();
  wcHas.mockClear();
  wcHas.mockReturnValue(true);
});

beforeAll(() => {
  // @ts-ignore
  workspace.workspaceFolders = [
    {
      uri: {
        path: DEFAULT_ROOT_FOLDER,
        fsPath: DEFAULT_ROOT_FOLDER,
      },
    },
  ];

  (<jest.Mock>workspace.getConfiguration).mockImplementation(() => ({
    get: wcGet,
    has: wcHas,
  }));
});

afterAll(() => {
  // @ts-ignore Reset to default
  workspace.workspaceFolders = [];
  jest.clearAllMocks();
});

test("should work for boolean unset in config", async () => {
  wcHas.mockReturnValue(false);

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].enable).toBeTruthy();
});

test("should work for boolean set to false in config", async () => {
  wcGet.mockImplementation((key: keyof WorkspaceConfig) => {
    switch (key) {
      case "enable":
        return false;
      default:
        return DEFAULT_CONFIG[key];
    }
  });

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].enable).toBeFalsy();
});

test("should work for string array unset in config", async () => {
  wcHas.mockReturnValue(false);

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].ignore).toContain("**/node_modules/**");
});

test("should work for string array set to empty in config", async () => {
  wcGet.mockImplementation((key: keyof WorkspaceConfig) => {
    switch (key) {
      case "ignore":
        return [];
      default:
        return DEFAULT_CONFIG[key];
    }
  });

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].ignore.length).toBe(0);
});

test("should work for string array set to other values in config", async () => {
  wcGet.mockImplementation((key: keyof WorkspaceConfig) => {
    switch (key) {
      case "ignore":
        return ["foo", "bar"];
      default:
        return DEFAULT_CONFIG[key];
    }
  });

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].ignore.length).toBe(2);
  expect(config[CACHE.activeRootPath].ignore).toContain("foo");
  expect(config[CACHE.activeRootPath].ignore).not.toContain(
    "**/node_modules/**"
  );
});

test("should convert configs mode, postcssPLugins, postcssSyntax", async () => {
  wcGet.mockImplementation((key: keyof WorkspaceConfig) => {
    switch (key) {
      case "mode":
        return "warn";
      case "postcssPlugins":
        return ["foo"]; // Old pattern
      case "postcssSyntax":
        return { "postcss-styled": ["styl", "css"] };
      case "themes":
        return null;
      default:
        return DEFAULT_CONFIG[key];
    }
  });

  const { config } = await setup();
  expect(config[CACHE.activeRootPath].mode).toMatchObject(["warn", {}]);
  expect(config[CACHE.activeRootPath].postcssPlugins).toMatchObject([
    ["foo", {}],
  ]);
  expect(config[CACHE.activeRootPath].postcssSyntax).toMatchObject({
    styl: "postcss-styled",
    css: "postcss-styled",
  });
  expect(config[CACHE.activeRootPath].themes).toMatchObject([]);
});
