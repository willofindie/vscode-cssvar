#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Usage:
 *  `git shortlog v2.1.0...v2.2.0 --format="%cI -> %s %n %b" |  ./src/scripts/create-changelog.js v2.2.0 | pbcopy`
 */

const dayjs = require("dayjs");

const releaseTag = process.argv[2];
let content = "";
process.stdin.resume();
process.stdin.on("data", function (buf) {
  content += buf.toString();
});
process.stdin.on("end", function () {
  const filtered = content
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
      changelogs.feature.push(msg.split("feat:")[1]);
    } else if (/fix:/.test(msg)) {
      changelogs.fix.push(msg.split("fix:")[1]);
    } else if (/chore:/.test(msg)) {
      changelogs.chore.push(msg.split("chore:")[1]);
    } else if (/refactor:/.test(msg)) {
      changelogs.refactor.push(msg.split("refactor:")[1]);
    } else if (/doc:/.test(msg)) {
      changelogs.doc.push(msg.split("doc:")[1]);
    }
  }
  console.log(`## [${releaseTag.substring(1)}] - ${lastReleaseDate}`);
  if (changelogs.feature.length > 0) {
    console.log("### Addded");
    changelogs.feature.forEach(line => console.log(`- ${line.trim()}`));
  }
  if (changelogs.fix.length > 0) {
    console.log("### Fixed");
    changelogs.fix.forEach(line => console.log(`- ${line.trim()}`));
  }
  if (changelogs.doc.length > 0) {
    console.log("### Doc");
    changelogs.doc.forEach(line => console.log(`- ${line.trim()}`));
  }
});
