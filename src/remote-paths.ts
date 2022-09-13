import { createWriteStream, existsSync, mkdirSync, unlink } from "fs";
import { resolve } from "path";
import { PassThrough, Readable } from "stream";
import { get, IncomingMessage } from "http";
import { get as sGet } from "https";
import { URL } from "url";
import {
  createUnzip,
  createBrotliDecompress,
  Unzip,
  BrotliDecompress,
} from "zlib";
import { version } from "../package.json";
import { CACHE } from "./constants";

//#region Get Fetch, replacement for fetch() Browser API
// Once VSCode officially starts supporting Node v17.5+
// I can migrate this code into using `fetch` api :relaxed:
const CSSGetError = class extends Error {
  code = 200;

  constructor(response: IncomingMessage, overrideMsg?: string) {
    super(overrideMsg || response.statusMessage || "CSSGetError: ");

    this.name = "CSSGetError";
    this.message = overrideMsg || response.statusMessage || "";
    this.code = response.statusCode || 200;
  }
};

export const getFetch = (url: string) =>
  new Promise<string>((res, rej) => {
    const _url = new URL(url);
    let httpGet = sGet;

    if (_url.protocol === "http:") {
      httpGet = get;
    }

    httpGet(
      _url,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "user-agent": `cssvar/${version}`,
          "accept-encoding": "deflate, gzip, br",
        },
      },
      message => {
        if (message.statusCode !== 200) {
          rej(new CSSGetError(message));
          return;
        }
        if (!/text\/css/.test(message.headers["content-type"] || "")) {
          rej(new CSSGetError(message, "Not a CSS request"));
          return;
        }

        const pathTokens = _url.pathname.split("/");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const filename = pathTokens.pop()!;
        const parentpath = resolve(CACHE.tmpDir, ...pathTokens);
        const filepath = resolve(parentpath, filename);

        if (!existsSync(parentpath)) {
          mkdirSync(parentpath, { recursive: true });
        }

        let inmemContent = "";
        const data = createWriteStream(filepath, { encoding: "utf-8" });
        const tunnel = new PassThrough();
        const checkFailure = () => {
          if (!message.complete) {
            /**
             * It is important to cleanup/remove cached files if request
             * somehow exited before properly writing to the file
             */
            unlink(filepath, err => {
              if (!err) {
                rej(
                  new CSSGetError(
                    message,
                    `Premature request termination: ${message.complete}`
                  )
                );
              }
              rej(err);
            });
          }
        };

        const encoding = message.headers["content-encoding"];
        let decompressorPipe: Unzip | BrotliDecompress | null = null;
        switch (encoding) {
          case "gzip":
          case "deflate":
            decompressorPipe = createUnzip();
            break;
          case "br":
            decompressorPipe = createBrotliDecompress();
            break;
          default:
        }

        let decompressedPipe: Readable = message;
        if (decompressorPipe) {
          decompressedPipe = message.pipe(decompressorPipe);
        }

        decompressedPipe.pipe(tunnel).pipe(data);

        tunnel.on("data", d => {
          inmemContent += d.toString();
        });
        message.on("close", checkFailure);
        message.on("end", checkFailure);
        data.on("close", () => res(inmemContent));
        data.on("error", rej);
      }
    ).on("error", rej);
  });
//#endregion
