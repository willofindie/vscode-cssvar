import lessSyntax from "postcss-less";
import { CssExtensions } from "../constants";
import scssParser from "./scss/safe-scss-parse";

export const getParser = async (ext: CssExtensions) => {
  switch (ext) {
    case "less":
      return lessSyntax.parse;
    default:
      return scssParser;
  }
};
