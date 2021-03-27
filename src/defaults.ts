export interface Config {
  workspaceFolder: string;
  files: string[];
  extensions: string[];
}

export const DEFAULT_CONFIG: Config = {
  workspaceFolder: "",
  files: ["index.css"],
  extensions: ["css", "scss", "sass", "less"],
};

export const EXTENSION_NAME = "cssvar";
export type EXTENSION_PROPERTIES = keyof Config;
