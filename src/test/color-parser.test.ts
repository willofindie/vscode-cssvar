import { serializeColor } from "../color-parser";

describe("Happy Flows color-parser", () => {
  it("can parse transparent", () => {
    const color = serializeColor("transparent");
    expect(color).toBe("rgba(0, 0, 0, 0)");
  });

  it("can parse named", () => {
    const color = serializeColor("tomato");
    expect(color).toBe("rgb(255, 99, 71)");
  });

  it("can parse hex3, hex4, hex6, hex8", () => {
    const color3 = serializeColor("#333");
    expect(color3).toBe("rgb(51, 51, 51)");
    const color6 = serializeColor("#333333");
    expect(color6).toBe("rgb(51, 51, 51)");
    const color4 = serializeColor("#3333");
    expect(color4).toBe("rgba(51, 51, 51, 0.2)");
    const color8 = serializeColor("#33333333");
    expect(color8).toBe("rgba(51, 51, 51, 0.2)");
  });

  it("can parse rgb", () => {
    const rgbResult = "rgb(25, 60, 30)";
    const rgbaResult = "rgba(25, 60, 30, 0.5)";
    let color = serializeColor(rgbResult);
    expect(color).toBe(rgbResult);
    color = serializeColor(rgbaResult);
    expect(color).toBe(rgbaResult);
  });

  it("can parse hsl", () => {
    const hslCSS_L3 = "hsl(235, 100%, 50%)";
    const hslCSS_L4 = "hsl(235 100% 50%)";
    const hsla = "hsla(235 100% 50% / .5)";
    const colorL3 = serializeColor(hslCSS_L3);
    const colorL4 = serializeColor(hslCSS_L4);
    const color = serializeColor(hsla);
    expect(colorL3).toBe("rgb(0, 21, 255)");
    expect(colorL4).toBe("rgb(0, 21, 255)");
    expect(color).toBe("rgba(0, 21, 255, 0.5)");
  });

  it("can parse hwb", () => {
    const color = serializeColor("hwb(194 0% 0%)");
    const colorAlpha = serializeColor("hwb(194 0% 0% / .5)");
    expect(color).toBe("rgb(0, 195, 255)");
    expect(colorAlpha).toBe("rgba(0, 195, 255, 0.5)");
  });

  it("can parse lch", () => {
    const color = serializeColor("lch(52.2345% 72.2 56.2)");
    const colorAlpha = serializeColor("lch(52.2345% 72.2 56.2 / .5)");
    expect(color).toBe("rgb(198, 93, 6)");
    expect(colorAlpha).toBe("rgba(198, 93, 6, 0.5)");
  });

  it("can parse lab", () => {
    const color = serializeColor("lab(52.2345% 40.1645 59.9971)");
    const colorAlpha = serializeColor("lab(52.2345% 40.1645 59.9971 / .5)");
    expect(color).toBe("rgb(198, 93, 6)");
    expect(colorAlpha).toBe("rgba(198, 93, 6, 0.5)");
  });
});

describe("Failures color-parser", () => {
  it("empty string", () => {
    const color = serializeColor("");
    expect(color).toBe("");
  });

  it("wrong hex", () => {
    const color = serializeColor("#34345");
    expect(color).toBe("");
  });

  it("unknown named CSS color", () => {
    const color = serializeColor("flamingo");
    expect(color).toBe("");
  });

  it("Unsupported CSS4 custom <color>: color() API", () => {
    const color = serializeColor("color(display-p3 1 0.5 0)");
    expect(color).toBe("");
  });
})
