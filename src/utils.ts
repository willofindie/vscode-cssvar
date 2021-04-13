/**
 * Utility helper functions
 */

import {
  Config,
  CSS3Colors,
  CSS_VAR_REGEX,
  SUPPORTED_CSS_RULE_TYPES,
} from "./constants";
import { CSSVarDeclarations } from "./main";
import { lighten } from "polished";
import { Declaration, Node, Rule } from "postcss";

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

export const isNodeType = <T extends Node>(
  node: Node,
  type: string
): node is T => {
  return !!node.type.match(type);
};

export function getVariableDeclarations(
  config: Config,
  node: Node,
  theme?: string | null
): CSSVarDeclarations[] {
  let declarations: CSSVarDeclarations[] = [];
  if (
    isNodeType<Declaration>(node, SUPPORTED_CSS_RULE_TYPES[1]) &&
    CSS_VAR_REGEX.test(node.prop)
  ) {
    declarations.push({
      property: node.prop,
      value: node.value,
      theme: theme || "",
    });
  } else if (isNodeType<Rule>(node, SUPPORTED_CSS_RULE_TYPES[0])) {
    const [theme] = config.themes.filter(theme => node.selector.match(theme));
    if (!config.excludeThemedVariables || !theme) {
      for (const _node of node.nodes) {
        const decls = getVariableDeclarations(config, _node, theme);
        declarations = declarations.concat(decls);
      }
    }
  }
  return declarations;
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
