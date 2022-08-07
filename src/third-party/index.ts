import { parse as lessParser } from "postcss-less";
import { CssExtensions, JsExtensions } from "../constants";
import scssParser from "./scss/safe-scss-parse";

export const getParser = async (ext: CssExtensions | JsExtensions) => {
  switch (ext) {
    case "less":
      return lessParser;
    default:
      return scssParser;
  }
};
