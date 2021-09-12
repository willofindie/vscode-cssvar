const CompletionItemKind = {
  Color: 15,
  Variable: 5,
};

class CompletionItem {
  /**
   * @type {(label: string, kind?: CompletionItemKind | undefined): CompletionItem}
   */
  constructor(lable, kind) {
    this.label = lable;
    this.kind = kind;
  }
}

class CompletionList {
  constructor(items) {
    this.items = items;
  }
}

class Position {
  /**
   * @param {number} line
   * @param {number} char
   */
  constructor(line, char) {
    this.line = line;
    this.character = char;
  }

  /**
   * @param {number} line
   * @param {number} char
   */
  with = jest.fn().mockImplementation((line, char) => {
    // Reference of https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/core/position.ts
    if (line === this.line && char === this.char) {
      return this;
    } else {
      return new Position(line, char);
    }
  });
}

class Range {
  /**
   * @param {Position} start
   * @param {Position} end
   */
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
};

const languages = {
  registerCompletionItemProvider: jest.fn((_, obj) => obj),
};

const window = {
  // eslint-disable-next-line no-console
  showErrorMessage: jest.fn(msg => console.trace(msg)),
};

module.exports = {
  CompletionItemKind,
  CompletionItem,
  CompletionList,
  workspace,
  languages,
  window,
  Position,
  Range,
};
