import { parseFiles } from "../parser";
import path from "path";

import { Config, DEFAULT_CONFIG, CACHE } from "../constants";
import { getLocalCSSVarLocation } from "./test-utilities";

const THEMING_CSS = path.resolve("src", "test", "fixtures", "theming.css");

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

type ConfigRecord = { [rootFolder: string]: Config };

const CONFIG: ConfigRecord = {
  [CACHE.activeRootPath]: {
    ...DEFAULT_CONFIG,
    files: [getLocalCSSVarLocation(THEMING_CSS)],
    mode: ["off", {}],
    postcssPlugins: [],
  },
};

// Following properties should never have duplicates
const NO_DUPLICATE_KEYS = new Set(["--scale-1", "--scale-2", "--scale-3"]);
const THEME_KEYS = new Set(["--brand-primary"]);

beforeEach(() => {
  CACHE.cssVars = { [CACHE.activeRootPath]: {} };
  CACHE.cssVarDefinitionsMap = { [CACHE.activeRootPath]: {} };
  CACHE.filesToWatch[CACHE.activeRootPath] = new Set();
  CACHE.fileMetas = {};
});

//#region Completion Provider tests
describe("Completion Provider", () => {
  it("should not have duplicates", async () => {
    await parseFiles(CONFIG);
    const variables = CACHE.cssVars[CACHE.activeRootPath][THEMING_CSS];
    expect(variables.length).toBeGreaterThan(0);
    const declSetShouldBeUnique = variables.filter(decl =>
      NO_DUPLICATE_KEYS.has(decl.property)
    );
    const colorDecls = variables.filter(decl => THEME_KEYS.has(decl.property));
    expect(declSetShouldBeUnique.length).toBe(3);
    expect(declSetShouldBeUnique).toEqual([
      expect.objectContaining({
        value: "1.875rem",
      }),
      expect.objectContaining({
        value: "2.25rem",
      }),
      expect.objectContaining({
        value: "3rem",
      }),
    ]);
    expect(colorDecls.length).toBe(1);
    expect(colorDecls[0]).toMatchObject({
      value: "#e03131",
    });
  });

  it("should not have any duplicates if the theme is present", async () => {
    await parseFiles({
      [CACHE.activeRootPath]: {
        ...CONFIG[CACHE.activeRootPath],
        themes: ["dark", "dim"],
        excludeThemedVariables: true,
      },
    });
    const variables = CACHE.cssVars[CACHE.activeRootPath][THEMING_CSS];
    const colorDecls = variables.filter(decl => THEME_KEYS.has(decl.property));
    expect(colorDecls.length).toBe(1);
    expect(colorDecls[0]).toMatchObject({
      value: "#4299e1",
    });
  });

  // This feature is also broken right now.
  // Need to fix this as well, as we want to show proper theme values,
  // if some of the themes are disabled. This needs modification in the current logic itself.
  it.skip("should have no duplicates if the theme is present and not excluded", async () => {
    await parseFiles({
      [CACHE.activeRootPath]: {
        ...CONFIG[CACHE.activeRootPath],
        themes: ["dark", "dim"],
        excludeThemedVariables: false,
      },
    });
    const variables = CACHE.cssVars[CACHE.activeRootPath][THEMING_CSS];
    const colorDecls = variables.filter(decl => THEME_KEYS.has(decl.property));
    expect(colorDecls.length).toBe(1);
    expect(colorDecls[0]).toMatchObject({
      value: "#ed8936",
    });
  });
});
//#endregion

//#region Definition Provider tests
describe("Definition Provider", () => {
  it("should have location for all duplicates when themes setting is empty", async () => {
    await parseFiles(CONFIG);
    const locations = CACHE.cssVarDefinitionsMap[CACHE.activeRootPath];
    expect(locations["--scale-1"]).toEqual([
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 2, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 5, character: 2 }),
        }),
      }),
    ]);
    expect(locations["--brand-primary"]).toEqual([
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 9, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 10, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 14, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 18, character: 2 }),
        }),
      }),
    ]);
  });

  // Need to fix this test as part of 2.3.0, when theme is present and some theme value is set
  // variables from other theme rule should never be populated in cssVars, but locations
  // for all the variables should be present, so that user's can still navigate to their sources.
  it.skip("should not have locations for all vairables when theme is provided and excluded as well", async () => {
    await parseFiles({
      [CACHE.activeRootPath]: {
        ...CONFIG[CACHE.activeRootPath],
        themes: ["dark"],
        excludeThemedVariables: true,
      },
    });
    const locations = CACHE.cssVarDefinitionsMap[CACHE.activeRootPath];
    expect(locations["--scale-1"]).toEqual([
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 2, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 5, character: 2 }),
        }),
      }),
    ]);
    expect(locations["--brand-primary"]).toEqual([
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 9, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 10, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 14, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 18, character: 2 }),
        }),
      }),
    ]);
  });

  it("should have locations for all variables sources when theme is provided but not excluded", async () => {
    await parseFiles({
      [CACHE.activeRootPath]: {
        ...CONFIG[CACHE.activeRootPath],
        themes: ["dark"],
        excludeThemedVariables: false,
      },
    });
    const locations = CACHE.cssVarDefinitionsMap[CACHE.activeRootPath];
    expect(locations["--brand-primary"]).toEqual([
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 9, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 10, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 14, character: 2 }),
        }),
      }),
      expect.objectContaining({
        range: expect.objectContaining({
          start: expect.objectContaining({ line: 18, character: 2 }),
        }),
      }),
    ]);
  });
});
//#endregion

//#region Color Provider tests
/**
 * Hover Provider tests would be also very similar, thus
 * combining Color Provider and Hover Provider tests into one.
 */
describe("Color Provider", () => {
  // cssVarsMap, already manages to remove duplicates, as it's a map.
  it("should have location for all duplicates when themes setting is empty", async () => {
    await parseFiles(CONFIG);
    const allProps = CACHE.cssVarsMap[CACHE.activeRootPath];
    expect(allProps["--brand-primary"]).toMatchObject({
      value: "#e03131",
      real: "#e03131",
    });
  });

  it("should not have location for themed duplicates when theme is excluded", async () => {
    await parseFiles({
      [CACHE.activeRootPath]: {
        ...CONFIG[CACHE.activeRootPath],
        themes: ["dark", "dim"],
        excludeThemedVariables: true,
      },
    });
    const allProps = CACHE.cssVarsMap[CACHE.activeRootPath];
    expect(allProps["--brand-primary"]).toMatchObject({
      value: "#4299e1",
      real: "#4299e1",
    });
  });
});
//#endregion
