import { DiagnosticCollection, TextDocument } from "vscode";
import { CACHE, DEFAULT_CONFIG } from "../../constants";
import { CSSVarDeclarations } from "../../main";
import { refreshDiagnostics } from "../../providers/diagnostics";
import { TextDocumentStub, DiagnosticCollectionStub } from "../test-utilities";

type ICache = typeof CACHE;

jest.mock("../../constants", () => {
  const DEFAULT_ROOT_FOLDER = "test";
  const CONSTANTS = jest.requireActual("../../constants");
  const VARIABLES_FILE = "path";

  return {
    __esModule: true,
    ...CONSTANTS,
    CACHE: {
      ...CONSTANTS.CACHE,
      activeRootPath: DEFAULT_ROOT_FOLDER,
      cssVarsMap: {
        [DEFAULT_ROOT_FOLDER]: {},
      },
      config: {
        [DEFAULT_ROOT_FOLDER]: {
          ...CONSTANTS.DEFAULT_CONFIG,
          files: [
            {
              local: VARIABLES_FILE,
              remote: "",
              isRemote: false,
            },
          ],
          mode: ["off", { ignore: [] }],
        },
      },
    } as ICache,
  };
});

const resetMockedCache = () => {
  const DEFAULT_ROOT_FOLDER = "test";
  const VARIABLES_FILE = "path";
  CACHE.activeRootPath = DEFAULT_ROOT_FOLDER;
  CACHE.cssVarsMap[DEFAULT_ROOT_FOLDER] = {};
  CACHE.config = {
    [DEFAULT_ROOT_FOLDER]: {
      ...DEFAULT_CONFIG,
      files: [
        {
          local: VARIABLES_FILE,
          remote: "",
          isRemote: false,
        },
      ],
      mode: ["off", { ignore: [] }],
    },
  };
};

beforeEach(() => {
  resetMockedCache();
});

test("Should not return diagnostics when turned off", () => {
  const docStub = new TextDocumentStub("color: var(--brand-primary);");
  const diagnosticCollectionStub = new DiagnosticCollectionStub("foo");

  // Update Mocked Cache values:
  CACHE.cssVarCount[CACHE.activeRootPath] = 1;

  refreshDiagnostics(
    <TextDocument>(<unknown>docStub),
    <DiagnosticCollection>(<unknown>diagnosticCollectionStub)
  );

  expect(diagnosticCollectionStub.get("foo")).toBe(undefined);
});

test("Should return diagnostics when turned on", () => {
  CACHE.cssVarsMap[CACHE.activeRootPath] = {
    // We don't have variable cached that we are looking for.
    "--brand-secondary": {} as unknown as CSSVarDeclarations,
  };
  const docStub = new TextDocumentStub(`
  color: var(--brand-secondary);
  color: var(--brand-primary);
  `);
  const diagnosticCollectionStub = new DiagnosticCollectionStub("foo");

  // Update Mocked Cache values:
  CACHE.cssVarCount[CACHE.activeRootPath] = 1;
  CACHE.config[CACHE.activeRootPath].mode[0] = "error";

  refreshDiagnostics(
    <TextDocument>(<unknown>docStub),
    <DiagnosticCollection>(<unknown>diagnosticCollectionStub)
  );

  expect(diagnosticCollectionStub.get("foo")).not.toBeNull();
  expect(diagnosticCollectionStub.get("foo").length).toBe(1);
  expect(diagnosticCollectionStub.get("foo")[0]).toMatchObject({
    desc: `Cannot find cssvar --brand-primary.`
  })
});

test("Should ignore variables which are added to `ignore` list", () => {
  CACHE.cssVarsMap[CACHE.activeRootPath] = {
    // We don't have variable cached that we are looking for.
    "--brand-secondary": {} as unknown as CSSVarDeclarations,
  };
  const docStub = new TextDocumentStub(`
  color: var(--brand-secondary);
  color: var(--brand-primary);
  `);
  const diagnosticCollectionStub = new DiagnosticCollectionStub("foo");

  // Update Mocked Cache values:
  CACHE.cssVarCount[CACHE.activeRootPath] = 1;
  CACHE.config[CACHE.activeRootPath].mode[0] = "error";
  CACHE.config[CACHE.activeRootPath].mode[1] = {
    ignore: ["--brand-primary"]
  };

  refreshDiagnostics(
    <TextDocument>(<unknown>docStub),
    <DiagnosticCollection>(<unknown>diagnosticCollectionStub)
  );

  // Since the logic runs, an empty set of diagnostics will be set to the collection.
  expect(diagnosticCollectionStub.get("foo").length).toBe(0);
});
