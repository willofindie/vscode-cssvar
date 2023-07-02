declare module "follow-redirects" {
  const http: typeof import("http");
  const https: typeof import("https");

  export { http, https };
}
