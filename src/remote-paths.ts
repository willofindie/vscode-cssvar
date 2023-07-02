import { createWriteStream, existsSync, mkdirSync, unlink } from "fs";
import { Readable } from "stream";
import { http, https } from "follow-redirects";
import { IncomingMessage } from "http";
import { URL } from "url";
import {
  createUnzip,
  createBrotliDecompress,
  Unzip,
  BrotliDecompress,
} from "zlib";
import { version } from "../package.json";
import { getCachedRemoteFilePath } from "./utils";

//#region Get Fetch, replacement for fetch() Browser API
// Once VSCode officially starts supporting Node v17.5+
// I can migrate this code into using `fetch` api :relaxed:
const CSSGetError = class extends Error {
  code = 200;

  constructor(response: IncomingMessage, overrideMsg?: string) {
    super(overrideMsg || response.statusMessage || "CSSGetError: ");

    this.name = "CSSGetError";
    this.code = response.statusCode ?? 200;
    this.message =
      `Response Status Code: ${this.code}, Message: ` +
      (overrideMsg ?? response.statusMessage ?? "");
  }
};

/**
 * This fetch method is tailored to work with only CSS assets.
 * If we try to fetch any other type of asset, this method will throw
 * It will try to fetch the asset and save it in a temp file as a cache.
 * If it fails it will throw a custom error.
 *
 * @param url Remote URL path for css asset
 */
export const fetchAndCacheAsset = (url: string) =>
  new Promise<void>((res, rej) => {
    const _url = new URL(url);
    let httpGet = https.get;

    if (_url.protocol === "http:") {
      httpGet = http.get;
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

        const [parentpath, filepath] = getCachedRemoteFilePath(_url);

        if (!existsSync(parentpath)) {
          mkdirSync(parentpath, { recursive: true });
        }

        const data = createWriteStream(filepath, { encoding: "utf-8" });
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
                return;
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
        decompressedPipe.pipe(data);

        message.on("close", checkFailure);
        message.on("end", checkFailure);
        data.on("close", () => res());
        data.on("error", rej);
      }
    ).on("error", rej);
  });
//#endregion
