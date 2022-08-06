/**
 * Ref: https://github.com/postcss/postcss-scss
 * I have modified it to work with my extension and use ES6 syntax and
 * module system instead.
 */
import { Container } from "postcss";

export default class NestedDeclaration extends Container {
  isNested: boolean;
  prop = "";
  important?: boolean;
  value: any;

  constructor(defaults?: Record<string, any>) {
    super(defaults);
    this.type = "decl";
    this.isNested = true;
    if (!this.nodes) this.nodes = [];
  }
}
