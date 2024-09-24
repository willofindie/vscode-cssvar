import { parse as lessParser } from "postcss-less";
import { CssExtensions, JsExtensions } from "../constants";
import scssParser from "./scss/safe-scss-parse";
import { ProcessOptions } from "postcss";

export const getParser = async (
  ext: CssExtensions | JsExtensions
): Promise<ProcessOptions["parser"]> => {
  switch (ext) {
    case "less":
      return lessParser as ProcessOptions["parser"];
    default:
      return scssParser;
  }
};
