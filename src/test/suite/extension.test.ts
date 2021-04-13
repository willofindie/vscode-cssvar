import assert from "assert";
import path from "path";
import * as vscode from "vscode";
import { EXTENSION_NAME } from "../../constants";
import { setup } from "../../main";

describe("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");
  let workspacePath = "";

  // before(async () => {

  // });

  it("Sample test", async () => {
    try {
      if (vscode.workspace.workspaceFolders) {
        workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
      }
      // FIXME(shub) This doesn't work at the moment
      const conf = vscode.workspace.getConfiguration(EXTENSION_NAME);
      await conf.update("files", ["index.css"]).then(res => res);
      const actual = path.resolve(workspacePath, "index.css");
      const { config } = setup();
      assert.strictEqual(actual, config.files[0]);
    } catch (e) {
      assert.fail(e.message);
    }
  });
});
