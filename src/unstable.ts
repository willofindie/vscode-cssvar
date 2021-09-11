/**
 * Enable Unstable Features, if user has added cofig for the same.
 */

import { CompletionItem } from "vscode";
import { UNSTABLE_FEATURES } from "./constants";

export const disableDefaultSort = (
  item: CompletionItem,
  options: {
    size: number;
    index: number;
  }
) => {
  if (UNSTABLE_FEATURES.no_sort) {
    const padSize = Math.floor(Math.log(options.size - 1) / Math.log(10) + 1);
    item.sortText = `${options.index}`.padStart(padSize, "0");
  }
};
