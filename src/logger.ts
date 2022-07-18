/* eslint-disable no-console */
import { EXTENSION_NAME } from "./constants";

export const LOGGER = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${EXTENSION_NAME}]: `, ...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.info(`[${EXTENSION_NAME}]: `, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[${EXTENSION_NAME}]: `, ...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(`[${EXTENSION_NAME}]: `, ...args);
    }
  },
};
