import { get, IncomingMessage } from "http";
import { get as sGet } from "https";

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

    httpGet(_url, message => {
      if (message.statusCode !== 200) {
        rej(new CSSGetError(message));
        return;
      }
      if (!/text\/css/.test(message.headers["content-type"] || "")) {
        rej(new CSSGetError(message, "Not a CSS request"));
        return;
      }

      let data = "";
      const complete = () => {
        if (message.complete) {
          res(data);
        } else {
          rej(
            new CSSGetError(
              message,
              `Premature request termination: ${message.complete}`
            )
          );
        }
      };

      message.on("data", d => {
        data += d.toString();
      });
      message.on("close", complete);
      message.on("end", complete);
    }).on("error", rej);
  });
//#endregion
