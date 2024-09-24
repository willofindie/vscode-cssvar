import { Location, Position, Range, TextDocument, Uri } from "vscode";
import { CACHE } from "../constants";
import { CssDefinitionProvider } from "../providers/definition-provider";
import { TextDocumentStub } from "./test-utilities";

jest.mock("../constants", () => {
  const DEFAULT_ROOT_FOLDER = "test";
  const CONSTANTS = jest.requireActual("../constants");
  const VARIABLES_FILE = "path";

  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      activeRootPath: DEFAULT_ROOT_FOLDER,
      config: {
        [DEFAULT_ROOT_FOLDER]: {
          ...CONSTANTS.DEFAULT_CONFIG,
          files: [VARIABLES_FILE],
        },
      },
    },
  };
});

jest.mock("../main", () => {
  return {
    __esModule: true,
    setup: jest.fn().mockResolvedValue({}),
  };
});
jest.mock("../utils", () => {
  const DEFAULT_ROOT_FOLDER = "test";
  return {
    __esModule: true,
    getActiveRootPath: jest.fn().mockReturnValue(DEFAULT_ROOT_FOLDER),
  };
});

let defProvider: CssDefinitionProvider | null;

beforeAll(() => {
  defProvider = new CssDefinitionProvider();
});

afterAll(() => {
  defProvider = null;
});

test("Definition Provider to work with variables present", async () => {
  CACHE.cssVarDefinitionsMap = {
    [CACHE.activeRootPath]: {
      "--color-red-300": [
        new Location(
          {
            path: "/foo/bar",
          } as Uri,
          new Range(new Position(0, 3), new Position(0, 18))
        ),
      ],
    },
  };
  const document = new TextDocumentStub(
    "color: var(--color-red-300)"
  ) as unknown as TextDocument;
  const def = (await defProvider?.provideDefinition(
    document,
    new Position(0, 14)
  )) as Location[];

  expect(def.length).toBeGreaterThan(0);
  expect(def[0].uri).toMatchObject({ path: "/foo/bar" });
});

test("Definition Provider to work w/ var() function with spaces", async () => {
  const document = new TextDocumentStub(
    "color: var( --color-red-300 )"
  ) as unknown as TextDocument;
  const def = (await defProvider?.provideDefinition(
    document,
    new Position(0, 14)
  )) as Location[];

  expect(def.length).toBeGreaterThan(0);
  expect(def[0].uri).toMatchObject({ path: "/foo/bar" });
});
