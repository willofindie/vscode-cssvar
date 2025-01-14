#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Usage:
 *  `./src/scripts/create-changelog.js v2.1.0...v2.2.0 | pbcopy`
 *  OR
 *  `./src/scripts/create-changelog.js v2.1.0..HEAD | pbcopy`
 */

const { spawn } = require("node:child_process");
const dayjs = require("dayjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).argv;
const compareString = argv._[0];

const gitLog = () =>
  new Promise((res, rej) => {
    const contents = [];
    /** @type {import("node:child_process").ChildProcessWithoutNullStreams} */
    const git = spawn("git", [
      "shortlog",
      compareString,
      "--format=%cI -> %s %n %b",
    ]);
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

const processCommitMsg = (/** @type {string[]} */ msgTokens) => {
  return msgTokens.map(token => {
    return token
      .trim()
      .replace(
        /(\[?#(\d+)\]?)/,
        "$1(https://github.com/willofindie/vscode-cssvar/issues/$2)"
      );
  });
};

(async () => {
  try {
    const log = await gitLog();
    const [, releaseTag] = compareString.split("...");
    const filtered = log
      .split("\n")
      .filter(line => /\d{4}-\d{2}-\d{2}/.test(line))
      .map(line =>
        line.split("->").map((token, i) => {
          const s = token.trim();
          if (i === 0) {
            return new Date(s);
          }
          return s;
        })
      )
      .sort((a, b) => +b[0] - +a[0]);

    const lastReleaseDate = dayjs(filtered[0][0]).format("YYYY-MM-DD");
    const changelogs = {
      feature: [],
      fix: [],
      chore: [],
      refactor: [],
      doc: [],
    };
    for (const [, msg] of filtered) {
      if (/^v\d+\.\d+\.\d+$/.test(msg)) {
        continue;
      }

      if (/feat:/.test(msg)) {
        changelogs.feature.push(processCommitMsg(msg.split("feat:")).join(" "));
      } else if (/fix:/.test(msg)) {
        changelogs.fix.push(processCommitMsg(msg.split("fix:")).join(" "));
      } else if (/chore:/.test(msg)) {
        changelogs.chore.push(processCommitMsg(msg.split("chore:")).join(" "));
      } else if (/refactor:/.test(msg)) {
        changelogs.refactor.push(
          processCommitMsg(msg.split("refactor:")).join(" ")
        );
      } else if (/doc:/.test(msg)) {
        changelogs.doc.push(processCommitMsg(msg.split("doc:")).join(" "));
      } else {
        // Push everything else to `feature`, to track the commits and remove them later.
        changelogs.feature.push(msg);
      }
    }
    console.log(
      `## [${releaseTag.substring(
        1
      )}](https://github.com/willofindie/vscode-cssvar/compare/${compareString}) - ${lastReleaseDate}`
    );
    if (changelogs.feature.length > 0) {
      console.log("### Features");
      changelogs.feature.forEach(line => console.log(`- ${line}`));
    }
    if (changelogs.fix.length > 0) {
      console.log("### Fixes");
      changelogs.fix.forEach(line => console.log(`- ${line}`));
    }
    if (changelogs.doc.length > 0) {
      console.log("### Doc");
      changelogs.doc.forEach(line => console.log(`- ${line}`));
    }
  } catch (e) {
    console.error(e);
  }
})();
