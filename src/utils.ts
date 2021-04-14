/**
 * Utility helper functions
 */

import {
  CSS3Colors,
  CSSVarRecord,
  JS_IDS,
  SupportedLanguageIds,
} from "./constants";
import { CSSVarDeclarations } from "./main";
import { lighten } from "polished";

/**
 * This method will help convert non-conventional
 * color calues like color names `red` etc.
 * to their proper HEX values, so that VSCode
 * can show their colors in Helper Dialog.
 */
export function getColor(
  value: string,
  cssVars?: CSSVarDeclarations[]
): {
  success: boolean;
  color: string;
} {
  if (cssVars && /^var/.test(value)) {
    const propertyName = value.match(/^var\((--[\w-]*)\)/);
    if (propertyName) {
      const cssVar = cssVars.find(
        cssVar => cssVar.property === propertyName[1]
      );
      return getColor(cssVar?.value || "");
    }
  } else {
    if (
      /^#|^rgba?|^hsla?|^transparent$/.test(value) ||
      CSS3Colors.includes(value.toLowerCase())
    ) {
      return {
        success: true,
        color: lighten(0, value),
      };
    }
  }
  return {
    success: false,
    color: "",
  };
}

export const isObjectProperty = <T>(obj: T, key: any): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

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
