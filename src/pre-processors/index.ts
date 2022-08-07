import { CssExtensions, JsExtensions } from "../constants";
import { templateLiteralPreProcessor } from "./template-literals";

export default async function preProcessContent(
  input: string,
  ext: CssExtensions | JsExtensions
) {
  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return await templateLiteralPreProcessor(input);

    default:
      return input;
  }
}
