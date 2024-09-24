#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check
const { spawn } = require("node:child_process");
require("dotenv").config();

const spawnAsync = (command, ...args) =>
  new Promise((res, rej) => {
    const thread = spawn(command, args, {
      env: process.env,
      stdio: "inherit",
    });

    thread.on("close", code => {
      if (code !== 0) {
        rej(code);
      }
      res(0);
    });
  });

Promise.all([spawnAsync("yarn", "test"), spawnAsync("yarn", "build")])
  .then(([c1, c2]) => {
    console.log("Results: ", c1, c2);
    return Promise.allSettled([
      spawnAsync("vsce", "publish"),
      spawnAsync("ovsx", "publish", "-p", process.env.OVSX_KEY),
    ]);
  })
  .catch(reason => {
    console.error(reason);
    process.exit(1);
  });
