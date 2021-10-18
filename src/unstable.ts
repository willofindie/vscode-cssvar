/**
 * Enable Unstable Features, if user has added cofig for the same.
 */

import { CompletionItem } from "vscode";
import { Config } from "./constants";

export const disableDefaultSort = (
  config: Config,
  item: CompletionItem,
  options: {
    size: number;
    index: number;
  }
) => {
  if (config.disableSort) {
    const padSize = Math.floor(Math.log(options.size - 1) / Math.log(10) + 1);
    item.sortText = `${options.index}`.padStart(padSize, "0");
  }
};
