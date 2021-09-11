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

class Position {
  /**
   * @param {number} line
   * @param {number} char
   */
  constructor(line, char) {
    this.line = line;
    this.character = char;
  }

  with = jest.fn().mockImplementation((start, end) => {
    return new Range(start, end);
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

module.exports = {
  CompletionItemKind,
  CompletionItem,
  workspace,
  Position,
  Range,
};
