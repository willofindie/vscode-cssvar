import { serializeColor } from "../color-parser";

describe("Happy Flows color-parser", () => {
  it("can parse transparent", () => {
    const result = serializeColor("transparent");
    expect(result.color).toBe("rgba(0, 0, 0, 0)");
  });

  it("can parse named", () => {
    const result = serializeColor("tomato");
    expect(result.color).toBe("rgb(255, 99, 71)");
  });

  it("can parse hex3, hex4, hex6, hex8", () => {
    const result3 = serializeColor("#333");
    expect(result3.color).toBe("rgb(51, 51, 51)");
    const result6 = serializeColor("#333333");
    expect(result6.color).toBe("rgb(51, 51, 51)");
    const result4 = serializeColor("#3333");
    expect(result4.color).toBe("rgba(51, 51, 51, 0.2)");
    const result8 = serializeColor("#33333333");
    expect(result8.color).toBe("rgba(51, 51, 51, 0.2)");
  });

  it("can parse rgb", () => {
    const rgbResult = "rgb(25, 60, 30)";
    const rgbaResult = "rgba(25, 60, 30, 0.5)";
    let result = serializeColor(rgbResult);
    expect(result.color).toBe(rgbResult);
    result = serializeColor(rgbaResult);
    expect(result.color).toBe(rgbaResult);
  });

  it("can parse hsl", () => {
    const hslCSS_L3 = "hsl(235, 100%, 50%)";
    const hslCSS_L4 = "hsl(235 100% 50%)";
    const hsla = "hsla(235 100% 50% / .5)";
    const resultL3 = serializeColor(hslCSS_L3);
    const resultL4 = serializeColor(hslCSS_L4);
    const result = serializeColor(hsla);
    expect(resultL3.color).toBe("rgb(0, 21, 255)");
    expect(resultL4.color).toBe("rgb(0, 21, 255)");
    expect(result.color).toBe("rgba(0, 21, 255, 0.5)");
  });

  it("can parse hwb", () => {
    const result = serializeColor("hwb(194 0% 0%)");
    const resultAlpha = serializeColor("hwb(194 0% 0% / .5)");
    expect(result.color).toBe("rgb(0, 195, 255)");
    expect(resultAlpha.color).toBe("rgba(0, 195, 255, 0.5)");
  });

  it("can parse lch", () => {
    const result = serializeColor("lch(52.2345% 72.2 56.2)");
    const resultAlpha = serializeColor("lch(52.2345% 72.2 56.2 / .5)");
    expect(result.color).toBe("rgb(198, 93, 6)");
    expect(resultAlpha.color).toBe("rgba(198, 93, 6, 0.5)");
  });

  it("can parse lab", () => {
    const result = serializeColor("lab(52.2345% 40.1645 59.9971)");
    const resultAlpha = serializeColor("lab(52.2345% 40.1645 59.9971 / .5)");
    expect(result.color).toBe("rgb(198, 93, 6)");
    expect(resultAlpha.color).toBe("rgba(198, 93, 6, 0.5)");
  });
});

describe("Failures color-parser", () => {
  it("empty string", () => {
    const result = serializeColor("");
    expect(result.color).toBe("");
  });

  it("wrong hex", () => {
    const result = serializeColor("#34345");
    expect(result.isColor).toBeFalsy();
    expect(result.color).toBe("#34345");
  });

  it("unknown named CSS color", () => {
    const result = serializeColor("flamingo");
    expect(result.isColor).toBeFalsy();
    expect(result.color).toBe("flamingo");
  });

  it("Unsupported CSS4 custom <color>: color() API", () => {
    const result = serializeColor("color(display-p3 1 0.5 0)");
    expect(result.isColor).toBeFalsy();
    expect(result.color).toBe("color(display-p3 1 0.5 0)");
  });
})
