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

class Location {
  /**
   * @param {Uri} uri
   * @param {Rage | Position} range
   */
  constructor(uri, range) {
    this.uri = uri;
    this.range = range;
  }
}

class Color {
  constructor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
  createFileSystemWatcher: jest.fn().mockReturnValue({
    onDidChange: jest.fn(),
    onDidDelete: jest.fn(),
  }),
};

const languages = {
  registerCompletionItemProvider: jest.fn((_, obj) => obj),
  registerColorProvider: jest.fn((_, obj) => obj),
};

const window = {
  // eslint-disable-next-line no-console
  showErrorMessage: jest.fn(msg => console.trace(msg)),
  // For now I am not testing switching between muti-roots
  onDidChangeActiveTextEditor: cb => {
    cb && cb();
  },
};

const Uri = {
  parse: path => path,
  file: path => path,
};

export class RelativePattern {
  constructor(base, pattern) {
    this.base = base;
    this.pattern = pattern;
  }
}

module.exports = {
  CompletionItemKind,
  CompletionItem,
  CompletionList,
  workspace,
  languages,
  window,
  Position,
  Range,
  Color,
  Location,
  EndOfLine: {
    LF: 1,
    CRLF: 2,
  },
  Uri,
  RelativePattern,
};
