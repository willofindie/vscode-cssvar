import path from "path";
import { ExtensionContext, Position, Range } from "vscode";
import { Config, DEFAULT_CONFIG, SupportedLanguageIds } from "../constants";
import { activate } from "../extension";
import { setup } from "../main";

var DUMMY_FILE = path.resolve("src", "test", "touch.css");

jest.mock("../constants", () => {
  const CONSTANTS = jest.requireActual("../constants");
  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      config: CONSTANTS.DEFAULT_CONFIG,
    }
  };
});
jest.mock("../main", () => {
  const MAIN = jest.requireActual("../main");
  return {
    __esModule: true,
    ...MAIN,
    setup: jest.fn(),
  };
});

const runActivate = async (line: string, id: SupportedLanguageIds) => {
  const subscriptions: {
    provideCompletionItems: (
      doc: {
        getText: () => string;
        languageId: SupportedLanguageIds;
      },
      position: Position
    ) => Promise<any[]>;
  }[] = [];
  await activate(({ subscriptions } as unknown) as ExtensionContext);
  return await subscriptions[0].provideCompletionItems(
    { getText: () => line, languageId: id },
    new Position(0, line.length)
  )
};

describe("Test Extension Activations and Results", () => {
  beforeEach(() => {
    const _setup = setup as jest.Mock;
    _setup.mockImplementation(() =>
      Promise.resolve().then(() => ({
        config: {
          ...DEFAULT_CONFIG,
          files: [DUMMY_FILE],
        },
      }))
    );
  });
  it("should activate", async () => {
    const lines = [
      "color: -",
      "color: --",
      "color: --c",
      "-webkit: --",
      "-webkit: `--", // CSS-in-JS, should trigger only when two dashes are present
      "-webkit: ${`--`}",
      "-webkit: ${`--`}",
    ];
    expect(await runActivate(lines[0], "css")).not.toBeNull();
    expect(await runActivate(lines[1], "css")).not.toBeNull();
    expect(await runActivate(lines[2], "css")).not.toBeNull();
    expect(await runActivate(lines[3], "css")).not.toBeNull();
    expect(await runActivate(lines[4], "javascript")).not.toBeNull();
    expect(await runActivate(lines[5], "javascriptreact")).not.toBeNull();
    expect(await runActivate(lines[6], "javascriptreact")).not.toBeNull();
  });
  it("should not activate", async () => {
    const lines = [
      "-web", // Browser property declarations
      "--text", // Variable declaration
      "let x = -", // JS
      "x--", // JS
      "--", // JS
    ];
    expect(await runActivate(lines[0], "scss")).toBeNull();
    expect(await runActivate(lines[1], "less")).toBeNull();
    expect(await runActivate(lines[2], "typescript")).toBeNull();
    expect(await runActivate(lines[3], "typescriptreact")).toBeNull();
    expect(await runActivate(lines[4], "javascript")).toBeNull();
  });
});
