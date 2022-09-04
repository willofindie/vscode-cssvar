/**
 * This processor is responsible to extract template literals and provide a string representation
 * of the css-in-js into compatible scss string, with their positions intact so that goto
 * definitions work with JS sources as well.
 *
 * E.g A JS file with styled-component shown below:
 *
 * ```js
 * 01 | // RootComponent.jsx
 * 02 | const Title = styled.div`
 * 03 |    --color-1: red;
 * 04 |    --color-2: blue;
 * 05 |    font-size: 1.5em;
 * 06 |    text-align: center;
 * 07 |    color: var(--color-1)
 * 08 | `;
 * 09 |
 * 10 | render(
 * 11 |    <Wrapper>
 * 12 |      <Title>
 * 13 |        Hello World!
 * 14 |      </Title>
 * 15 |    </Wrapper>
 * 16 | );
 * ```
 *
 * should become something as follows:
 * ```scss
 * 01 |
 * 02 | :root {
 * 03 |    --color-1: red;
 * 04 |    --color-2: blue;
 * 05 |    font-size: 1.5em;
 * 06 |    text-align: center;
 * 07 |    color: var(--color-1)
 * 08 | }
 * 09 |
 * 10 |
 * 11 |
 * 12 |
 * 13 |
 * 14 |
 * 15 |
 * 16 |
 * ```
 *
 * Things to consider:
 *  - If JS file is considered as source, it shouldn't throw error while parsing and affect user ongoing task
 *  - JS files can continously change, which can trigger the parser many times. This is fine
 *    as parser triggers only when file is saved. Though, this a users responsibility to keep
 *    such CSS variable source files in different module, that doesn't change so frequently.
 */

const TEMPLATE_START_END = "`".charCodeAt(0);
const TEMPLATE_HEAD_START = "$".charCodeAt(0);
const JS_BLOCK_START = "{".charCodeAt(0);
const JS_BLOCK__END = "}".charCodeAt(0);
const TEMPLATE_ESCAPE = "\\".charCodeAt(0);

// Carriage Returns can be ignored for line breaks, because
// for every line break, irrespective of platform, it always ends
// with a line feed.
const LF = "\n".charCodeAt(0);

export const JS_BLOCK = "jsblock";
export const templateLiteralPreProcessor = async (input: string) => {
  let charIndex = 0;
  let started = false;
  let jsCodeStarted = false;
  let jsBlockDepth = 0;
  const stringBuilder: string[] = [];

  while (charIndex < input.length) {
    const code = input.charCodeAt(charIndex);
    const nextCode = input.charCodeAt(charIndex + 1);
    const char = input.charAt(charIndex);
    const nextChar = input.charAt(charIndex + 1);

    if (started) {
      // This is inside template literal
      if (jsCodeStarted && jsBlockDepth === 0 && code === JS_BLOCK__END) {
        // Template literals with JS expressions are ignored, thus we need to replace it with some CSS content
        stringBuilder.push(JS_BLOCK);
        jsCodeStarted = false;
      } else if (jsCodeStarted) {
        // Ignore every char here
        if (code === JS_BLOCK_START) {
          jsBlockDepth += 1;
        } else if (code === JS_BLOCK__END) {
          jsBlockDepth -= 1;
        } else if (code === LF) {
          stringBuilder.push("/* */\n");
        } else if (code === TEMPLATE_START_END) {
          // Unexpected end, this is when improper JS file is saved without end tokens
          stringBuilder.push("}");
          started = false;
          jsCodeStarted = false;
        }
        charIndex += 1;
        continue;
      } else if (code === TEMPLATE_ESCAPE) {
        stringBuilder.push(nextChar);
        charIndex += 1;
      } else if (code === TEMPLATE_HEAD_START && nextCode === JS_BLOCK_START) {
        // Start of JS code block, which we can ignore and replace with empty spaces/line breaks for proper char positions
        jsCodeStarted = true;
        charIndex += 1;
      } else if (code === TEMPLATE_START_END) {
        stringBuilder.push("}");
        started = false;
      } else {
        stringBuilder.push(char);
      }
    } else if (code === TEMPLATE_START_END && !started) {
      // This is start of the template literal
      stringBuilder.push(":root {");
      started = true;
    } else if (code === LF) {
      stringBuilder.push("\n");
    }
    // console.log(`CharCode: ${code}, Char: ${char}, index: ${charIndex}`)
    charIndex += 1;
  }

  return stringBuilder.join("");
};
