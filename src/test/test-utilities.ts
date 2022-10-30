import { CSSVarLocation } from "../constants";

export const getLocalCSSVarLocation = (path: string) =>
  ({
    local: path,
    remote: "",
    isRemote: false,
  } as CSSVarLocation);

export class TextDocumentStub {
  private document: string;
  private _uri: string;
  lineCount: number;
  lines: string[] = [];
  languageId: string;

  constructor(doc: string, uri = "foo") {
    this.document = doc;
    this.lines = doc.split("\n");
    this.lineCount = this.lines.length;
    this._uri = uri;
    this.languageId = "css";
  }

  // I have used a getter here, so that I can spy it if I want
  get uri() {
    return this._uri;
  }

  getText = jest.fn().mockImplementation(() => this.document);
  lineAt = jest.fn().mockImplementation((index: number) => ({ text: this.lines[index] }));
}

export class DiagnosticCollectionStub {
  private name: string;
  private map: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  set = jest.fn().mockImplementation((uri: string, obj: any) => {
    this.map.set(uri, obj);
  })
  get = jest.fn().mockImplementation((uri: string) => {
    return this.map.get(uri);
  })
}
