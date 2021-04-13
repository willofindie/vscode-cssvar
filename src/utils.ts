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
