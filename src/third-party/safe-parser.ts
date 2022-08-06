/* eslint-disable @typescript-eslint/ban-ts-comment */
/*!
 * Ref: https://github.com/postcss/postcss-safe-parser/blob/main/lib/safe-parser.js
 * I have modified it to work with my extension and use ES6 syntax and
 * module system instead.
 *
 * @license
 * Copyright (c) 2013 Andrey Sitnik <andrey@sitnik.ru>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { Root, Node } from "postcss";
import type { Token } from "postcss/lib/tokenize";
import Parser from "postcss/lib/parser";

export default abstract class SafeParser extends Parser {
  //#region Errors
  unknownWord(tokens: Token[]) {
    this.spaces += tokens.map(i => i[1]).join("");
    // console.log("Unknown Word: ", tokens);
  }

  unexpectedClose() {
    (<Root>this.current).raws.after += "}";
  }

  doubleColon() {
    return;
  }

  unnamedAtrule(node: Node) {
    // @ts-ignore
    node.name = "";
  }

  precheckMissedSemicolon(tokens: Token[] = []) {
    const colon = this.colon(tokens);
    if (colon === false) return;

    let nextStart, prevEnd;
    for (nextStart = colon - 1; nextStart >= 0; nextStart--) {
      if (tokens[nextStart][0] === "word") break;
    }
    if (nextStart === 0) return;

    for (prevEnd = nextStart - 1; prevEnd >= 0; prevEnd--) {
      if (tokens[prevEnd][0] !== "space") {
        prevEnd += 1;
        break;
      }
    }

    const other = tokens.slice(nextStart);
    const spaces = tokens.slice(prevEnd, nextStart);
    tokens.splice(prevEnd, tokens.length - prevEnd);
    this.spaces = spaces.map(i => i[1]).join("");

    this.decl(other);
  }

  checkMissedSemicolon(_?: Token[]) {
    return;
  }
  //#endregion
}
