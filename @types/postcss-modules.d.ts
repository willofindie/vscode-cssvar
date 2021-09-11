declare module "postcss-modules" {
  import { AcceptedPlugin } from "postcss";
  function postCssModules(): AcceptedPlugin;
  export default postCssModules;
}
