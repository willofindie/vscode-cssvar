import { CSSVarDeclarations } from "../main";
import { getColor } from "../utils";

describe("Utility Function Tests", () => {
  describe(`getColor`, () => {
    it("should return proper Hex string for unknown Color Names", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--red500",
          value: "red",
          theme: "",
        },
      ];
      const result = getColor(cssVars[0].value, cssVars);
      expect(result.success).toBeTruthy();
      expect(result.color).toEqual("#f00");
    });
    it("should return proper Hex string recursively", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--red500",
          value: "red",
          theme: "",
        },
        {
          property: "--bg01",
          value: "var(--red500)",
          theme: "",
        },
      ];
      const result = getColor(cssVars[1].value, cssVars);
      expect(result.success).toBeTruthy();
      expect(result.color).toEqual("#f00");
    });
    it("should not return color if value is not a color", () => {
      const cssVars: CSSVarDeclarations[] = [
        {
          property: "--pad-1",
          value: "16px",
          theme: "",
        },
        {
          property: "--spacing-x",
          value: "var(--pad-1)",
          theme: "",
        },
      ];
      const result = getColor(cssVars[1].value, cssVars);
      expect(result.success).toBeFalsy();
      expect(result.color).toEqual("");
    });
  });
});
