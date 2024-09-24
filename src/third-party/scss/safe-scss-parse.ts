import { Input, ProcessOptions } from "postcss";
import type { Root } from "postcss";
import ScssParser from "./parser";

export default function scssParse(
  scss: string | { toString(): string },
  opts?: Pick<ProcessOptions, "from" | "map">
): Root {
  const inputString = typeof scss === "string" ? scss : scss.toString();
  const input = new Input(inputString, opts);

  const parser = new ScssParser(input);
  parser.parse();

  return parser.root;
}
