import { FILTER_REGEX } from "../constants";

describe(`FILTER_REGEX constant cases`, () => {
  it("Should work for plain css files", () => {
    const css1 = ":--red";
    const css2 = ": --red";
    const css3 = ": var(--red";
    expect(FILTER_REGEX.test(css1)).toBeTruthy();
    expect(FILTER_REGEX.test(css2)).toBeTruthy();
    expect(FILTER_REGEX.test(css3)).toBeTruthy();
  });
  it("Should work for css-in-js files", () => {
    const css1 = "\"--red";
    const css2 = "'--red";
    const css3 = "'var(--red";
    expect(FILTER_REGEX.test(css1)).toBeTruthy();
    expect(FILTER_REGEX.test(css2)).toBeTruthy();
    expect(FILTER_REGEX.test(css3)).toBeTruthy();
  });
  it("Should fail for places where css variable intellisense should not be triggered", () => {
    const css1 = "--red"; // Line Start
    expect(FILTER_REGEX.test(css1)).toBeFalsy();
  });
});
