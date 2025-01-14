#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");

async function yarnV2List() {
  return new Promise((res, rej) => {
    const contents = [];
    /** @type {import("node:child_process").ChildProcessWithoutNullStreams} */
    const git = spawn("yarn", ["info", "--recursive --json"]);
    git.stdout.on("data", function (buf) {
      contents.push(buf.toString());
    });

    git.stderr.on("data", data => {
      rej(new Error(data.toString()));
    });

    git.on("close", code => {
      if (code !== 0) {
        rej(new Error(`Exited with ${code}:  Failed to complete git shortlog`));
      }
      res(contents.join(""));
    });
  });
}

(async () => {
  try {
    const log = await yarnV2List();
    console.log(log);
  } catch (e) {
    console.error(e);
  }
})();
