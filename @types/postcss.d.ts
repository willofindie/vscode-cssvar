type _Token = [
  tokenName: string,
  value?: string,
  startLine?: number,
  startCol?: number,
  endLine?: string | number,
  enCol?: string | number
];

type _Tokenizer = {
  back: (token: any) => void;
  nextToken: (opts?: any) => _Token | undefined;
  endOfFile: () => boolean;
  position: () => number;
};

type TokenizerOptions = {
  ignoreErrors?: boolean;
};

declare module "postcss/lib/tokenize" {
  import { Input } from "postcss";
  export default function tokenizer(
    input: Input,
    options?: import("postcss").ProcessOptions & TokenizerOptions
  ): Tokenizer;
  export type Token = _Token;
  export type Tokenizer = _Tokenizer;
}

declare module "postcss/lib/parser" {
  import { Root, Input, Node } from "postcss";

  class Parser {
    root: Root;
    input: Input;
    tokenizer: _Tokenizer;
    spaces: string;
    current: Node;
    semicolon: boolean;
    customProperty: boolean;

    constructor(input: Input);
    createTokenizer(): void;
    parse(): void;

    comment(token: _Token): void;
    emptyRule(token: _Token): void;
    other(start: number): void;
    rule(tokens: _Token[]): void;
    decl(tokens: _Token[], customProperty?: string): void;
    atrule(token: _Token): void;
    end(token: _Token): void;
    endFile(): void;
    freeSemicolon(token: _Token): void;

    // Helpers
    getPosition(offset: number): {
      offset: number;
      line: number;
      column: number;
    };
    init(node: Node, offset: any): void;
    raw(node: Node, prop: string, tokens: _Token[], customProperty: any): void;
    spacesAndCommentsFromEnd(tokens: _Token[]): string;
    spacesAndCommentsFromStart(tokens: _Token[]): string;
    spacesFromEnd(tokens: _Token[]): string;
    stringFrom(tokens: _Token[], from: any): string;
    colon(tokens: _Token[]): false | number;

    // Errors
    unclosedBracket(bracket: number[]): void;
    unknownWord(tokens: _Token[]): void;
    unexpectedClose(token: _Token): void;
    unclosedBlock(): void;
    doubleColon(token: _Token): void;
    unnamedAtrule(node: Node, token: _Token): void;
    precheckMissedSemicolon(tokens?: _Token[]): void;
    checkMissedSemicolon(tokens: _Token[]): void;
  }
  export default Parser;
}

declare module "@tokencss/postcss" {
  export default function plugin(options?: any): void;
}
