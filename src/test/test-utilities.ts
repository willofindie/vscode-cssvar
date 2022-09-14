import { CSSVarLocation } from "../constants";

export const getLocalCSSVarLocation = (path: string) =>
  ({
    local: path,
    remote: "",
    isRemote: false,
  } as CSSVarLocation);
