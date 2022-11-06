/**
 * Utility helper functions
 */

import {
  CSSVarRecord,
  CSS_COLOR_ARG_PARSER,
  CSS_COLOR_FUNCTION_NOTATION,
  CSS_REGEX_INITIATOR,
  CSS_VAR_FUNCTION_NOTATION,
  JSS_REGEX_INITIATOR,
  JS_IDS,
  SCSS_COLOR_INTERPOLATION,
  SupportedLanguageIds,
  VAR_KEYWORD_REVERSE,
  CACHE,
  PATTERN_ALL_VARIABLE_USAGES,
} from "./constants";
import { CSSVarDeclarations } from "./main";
import { serializeColor } from "./color-parser";
import { Range, window, workspace } from "vscode";
import { URL } from "url";
import { resolve } from "path";
import { existsSync } from "fs";
import { LOGGER } from "./logger";

/**
 * [TODO] Change this method to a more generic recursion call to
 * normalize `var()` calls to their original values.
 *
 * This method will help convert non-conventional
 * color values like color names `red` etc.
 * to their proper HEX values, so that VSCode
 * can show their colors in Helper Dialog.
 */
export async function normalizeVars(
  value: string,
  cssVars?: CSSVarDeclarations[]
): Promise<{
  isColor: boolean;
  value: string;
}> {
  if (cssVars && CSS_VAR_FUNCTION_NOTATION.test(value)) {
    // If value contains a CSS variable, we need to resolve each one of them.
    const propertyName = value.match(CSS_VAR_FUNCTION_NOTATION)?.groups?.args;
    if (propertyName) {
      const cssVar = cssVars.find(cssVar => cssVar.property === propertyName);
      return await normalizeVars(cssVar?.value || "");
    }
  } else if (cssVars && SCSS_COLOR_INTERPOLATION.test(value)) {
    // If the value is an interpolated SCSS string.
    const result = value.match(SCSS_COLOR_INTERPOLATION);
    if (result && result[1]) {
      const cssVar = cssVars.find(cssVar => cssVar.property === result[1]);
      return await normalizeVars(cssVar?.value || "");
    }
  } else {
    let _value = value;
    const colorFnMatch = value.match(CSS_COLOR_FUNCTION_NOTATION);
    if (colorFnMatch) {
      // Value is a supported CSS Color Function.
      const fnName = colorFnMatch[1];
      const hasDivider = value.includes("/");
      const args = value.match(CSS_COLOR_ARG_PARSER)?.filter(m => !!m);
      if (args) {
        const parsedValues = await Promise.all(
          args.map(value => normalizeVars(value, cssVars))
        );
        // hasDivider is required for values like `hsl(var(--color) / 30%)`, where
        // we have less than 4 parsedValued
        if (hasDivider || parsedValues.length > 3) {
          const alpha = parsedValues.pop();
          _value = `${fnName}(${parsedValues
            .map(val => val.value)
            .join(" ")} / ${alpha?.value})`;
        } else {
          _value = `${fnName}(${parsedValues.map(val => val.value).join(" ")})`;
        }
      }
    }
    const result = serializeColor(_value);
    return {
      isColor: result.isColor,
      value: result.color,
    };
  }
  return {
    isColor: false,
    value,
  };
}

/**
 * Once the Variables are parsed, there are still nested variable values
 * like --x: var(--y), whose value is unknown. This method will populate such
 * values and also, populate the color properties for each declarations.
 */
export const populateValue = async (
  cssVars: CSSVarRecord
): Promise<[CSSVarDeclarations[], Record<string, CSSVarDeclarations>]> => {
  // Get Color for each, and modify the cssVar Record.
  const vars = getCSSDeclarationArray(cssVars);

  // TODO(phoenisx) Remove this state.
  const cssVarsMapToSelf = vars.reduce((defs, cssVar) => {
    defs[cssVar.property] = cssVar;
    return defs;
  }, {} as Record<string, CSSVarDeclarations>);

  // Mutating self inside the loop is not performant
  /**
   * [TODO(shub)] Improve the following code:
   * - There can be duplicate variables; thus once value is found:
   *    - We can either skip any subsequent loops for the same variable.
   *    - Or make subsequent variable values scope aware. I mean decipher
   *      nearset value set for that variable. This is too difficult, because it depends
   *      on HTML layout and what parent a rule will reside under. (Skip)
   * - `getValue` function should be memoized once the recursion starts.
   */
  for await (const cssVar of vars) {
    const isVariable = getVariableType(cssVar.value);
    if (typeof isVariable === "string") {
      const value = getValue(getVariableName(cssVar.value), vars);
      cssVar.value = value || cssVar.value;
    }

    const color = await normalizeVars(cssVar.value, vars);
    if (color.isColor) {
      cssVar.color = color.value;
    }
  }

  return [vars, cssVarsMapToSelf];
};

function getValue(
  prop: string, // Points to CSS variable name (a.k.a Propname in a CSS declarations)
  cssVars: CSSVarDeclarations[]
): string | null {
  const currentCssVar = cssVars.reduce<CSSVarDeclarations | null>(
    (currentCssVar, cssVar) => {
      if (
        !currentCssVar &&
        cssVar.property === prop &&
        !cssVar.value.match(PATTERN_ALL_VARIABLE_USAGES)
      ) {
        currentCssVar = cssVar;
      }
      return currentCssVar;
    },
    null
  );
  if (currentCssVar) {
    const variableType = getVariableType(currentCssVar.value);
    if (variableType === null) {
      return currentCssVar.value;
    } else {
      return getValue(getVariableName(currentCssVar.value), cssVars);
    }
  }

  return null;
}

export const isObjectProperty = <T>(obj: T, key: any): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const isObjectEmpty = (obj: Record<string, any>): boolean =>
  Object.keys(obj).filter(key => isObjectProperty(obj, key)).length === 0;

/**
 * Shallow Compare any JS POJO, to test immutability
 */
export const shallowCompare = (obj1: any, obj2: any) => {
  if (obj1 == null || obj2 == null) {
    return obj1 !== obj2;
  }
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === "string" || obj1 instanceof String) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "number" || obj1 instanceof Number) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "boolean" || obj1 instanceof Boolean) {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const isEqual = obj1.length === obj2.length;
    if (isEqual) {
      return obj1.every((item, index) => item === obj2[index]);
    } else {
      return isEqual;
    }
  }
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      key => isObjectProperty(obj2, key) && obj1[key] === obj2[key]
    )
  );
};

/**
 * Get an Array reresentation for the
 * CSSVarDeclaration Record.
 */
export const getCSSDeclarationArray = (cssVars: CSSVarRecord) =>
  Object.keys(cssVars).reduce(
    (acc, key) => acc.concat(cssVars[key]),
    [] as CSSVarDeclarations[]
  );

export const isCSSInJS = (languageId: SupportedLanguageIds) =>
  JS_IDS.includes(languageId as any);

export const reverseFindVarKeyword = (
  input: string,
  startPos: number
): boolean => {
  for (let index = 0; index < 4; index++) {
    if (input.charAt(startPos - index - 1) !== VAR_KEYWORD_REVERSE[index]) {
      return false;
    }
  }
  return true;
};

export interface Region {
  range: Range;
  insideVar: boolean;
  suffixChar: string;
}

/**
 * Restrict Intellisense if we do not get a proper CSS Variable activator.
 * This function will return an array of regions, where CSS Variable is found.
 * If no CSS Variable value is found, an empty array will be returned, for which
 * we can ignore intellisense calls.
 *
 * @param text Should be the text from start of the line
 * @param lang supported lang, like JS/TS/CSS etc.
 * @param currentRange Current Line and Character Range where the text cursor is present.
 */
export const restrictIntellisense = (
  text: string,
  lang: SupportedLanguageIds,
  currentRange: Range
): Region[] => {
  // irrespective of JS or CSS files, `:` is the common entity
  // that is present while defining CSS Values, thus splitting it
  // into two halves will give us the value in second.
  const [property, value] = text.split(":");
  if (!value) {
    return [];
  }

  const cursorPosition = currentRange.end;
  const findRegion = (start: number, size: number): Region => {
    const range = new Range(
      cursorPosition.with(cursorPosition.line, property.length + 1 + start),
      cursorPosition.with(cursorPosition.line, property.length + start + size)
    );
    const suffixChar = value.charAt(start + size);
    const insideVar = reverseFindVarKeyword(value, start);
    return {
      range,
      suffixChar,
      insideVar,
    };
  };
  if (isCSSInJS(lang)) {
    const results = [...value.matchAll(JSS_REGEX_INITIATOR)];
    const regions = results.map(result => {
      const size = result[1].length; // Returns the matched strings length.
      const start = result.index || 0;
      return findRegion(start, size);
    });
    return regions;
  } else {
    const results = [...value.matchAll(CSS_REGEX_INITIATOR)];
    const regions = results.map(result => {
      const size = result[1].length; // Returns the matched strings length.
      const start = (result.index || 0) + 1;
      return findRegion(start, size);
    });
    return regions;
  }
};

const getVariableName = (value: string): string => {
  if (value.match(/^var\s*\(/)) {
    return value.replace(/var\s*\((.*?)\)/, "$1").trim();
  }

  return value;
};

export const getVariableType = (
  value: string
): "css" | "sass" | "less" | null => {
  if (value.startsWith("$")) {
    return "sass";
  }
  if (value.startsWith("@")) {
    return "less";
  }
  if (value.startsWith("--")) {
    return "css";
  }

  if (value.match(/^var\s*\(/)) {
    return getVariableType(value.replace(/var\s*\((.*?)\)/, "$1").trim());
  }

  return null;
};

export const getCSSErrorMsg = (
  filepath: string,
  error: Record<string, any>
) => {
  if (
    isObjectProperty(error, "name") &&
    isObjectProperty(error, "reason") &&
    isObjectProperty(error, "line")
  ) {
    return JSON.stringify(
      {
        name: error.name,
        reason: error.reason,
        file: filepath,
        line: error.line,
        column: error.column,
        endLine: error.endLine,
        endColumn: error.endColumn,
      },
      null,
      2
    );
  }
  return error;
};

export const getActiveRootPath = (firstFolderPath = CACHE.activeRootPath) => {
  if (window.activeTextEditor) {
    return (
      workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri
        .fsPath || firstFolderPath
    );
  }
  return firstFolderPath;
};

export const getCachedRemoteFilePath = (url: URL) => {
  const pathTokens = url.pathname.split("/");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const filename = pathTokens.pop()!;
  const parentpath = resolve(CACHE.tmpDir, ...pathTokens);
  return [parentpath, resolve(parentpath, filename)];
};

export const getRemoteCSSVarLocation = (url: string) => {
  const tmpFilePath = getCachedRemoteFilePath(new URL(url))[1];
  const alreadyCached = existsSync(tmpFilePath);
  return {
    local: getCachedRemoteFilePath(new URL(url))[1],
    remote: url,
    // Consider the URL to be local, if it's already cached
    isRemote: !alreadyCached,
  };
};

//#region Import Resolver for external postcss plugins/syntax parser modules

type ResolverOptions = {
  lookupPaths: string[] | undefined;
  cwd: string;
  [key: string]: any;
};

const resolveModuleInPaths = (name: string, paths: string[] | undefined) =>
  require(require.resolve(name, {
    paths,
  }));

/**
 * To fix #78:
 * I need to create a way to resolve and pass arguments to plugins dynamically.
 * Dynamically here means it should use a generic API, that can add some logic or use a config
 * to figure out how to instantiate a plugin. This would be really helpful for plugins which are
 * complicated to resolve and needs extra care with arguments, as they dop not support
 * pure JSON arguments.
 */
export async function postcssPluginResolver(
  name: string,
  options: ResolverOptions
) {
  const { lookupPaths, cwd, ...rest } = options;
  switch (name) {
    case "@tokencss/postcss": {
      if (!cwd || !existsSync(resolve(cwd, "token.config.json"))) {
        LOGGER.error("TokenCSS Config not found in: ", resolve(cwd));
        return null;
      }
      const _cwd = resolve(cwd);
      // VSCode/Electron does not support ESM modules, thus it becomes important to bundle them
      // with the code to make it work.
      try {
        const tokencss = await import("@tokencss/postcss").then(m => m.default);
        return tokencss({ cwd: _cwd, ...rest });
      } catch (e) {
        LOGGER.error(">>>>> Error Import: ", e);
        return null;
      }
    }
    default: {
      try {
        const resolvedMod = resolveModuleInPaths(name, lookupPaths);
        return resolvedMod(rest);
      } catch (e: any) {
        window.showErrorMessage(
          `Cannot resolve postcss plugin ${name}. Please add postcss@8 as project's dependency.`
        );
        LOGGER.error(`Failed to load postcss plugin: ${lookupPaths}`, e);
      }
      return null;
    }
  }
}
