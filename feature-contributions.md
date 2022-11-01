<div align="center">
  <img
  src="https://user-images.githubusercontent.com/11786283/113474026-dd0dd100-948a-11eb-8140-4570d7c983d3.png"
  height="150"
  alt="CssVar Icon" />
</div>


<h1 align="center">
  CSS Variables
</h1>

<div align="center">
  <p align="center">
    <i><b>Please vote/rate and star this project to show your support.</b></i>
    ❤️
  </p>

  <a href="https://github.com/willofindie/vscode-cssvar">
    <img src="https://img.shields.io/github/stars/willofindie/vscode-cssvar?style=social" />
  </a>
  <!-- &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/size-%3C%20200KB-blue?style=flat" /> -->
  &nbsp;&nbsp;
  <a href="https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar">
    <img src="https://img.shields.io/visual-studio-marketplace/i/phoenisx.cssvar?label=vsc%20installs" />
  </a>
  &nbsp;&nbsp;
  <a href="https://open-vsx.org/extension/phoenisx/cssvar">
    <img src="https://img.shields.io/open-vsx/dt/phoenisx/cssvar?color=yellowgreen&label=ovsx%20installs" />
  </a>
  <br />
  <a href="https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar&ssr=false#review-details">
    <img src="https://img.shields.io/visual-studio-marketplace/r/phoenisx.cssvar?label=vsc%20rating" />
  </a>
  &nbsp;&nbsp;
  <a href="https://open-vsx.org/extension/phoenisx/cssvar/reviews">
    <img src="https://img.shields.io/open-vsx/rating/phoenisx/cssvar?color=yellowgreen&label=ovsx%20rating" />
  </a>
</div>

## 🛠 Supported Configs:

This Extension supports the following properties as of now:

<details open>
  <summary style="font-size: 1.25rem;">Settings</summary>


<table>
<thead>
  <tr align="left">
    <th><b>Setting</b></th>
    <th><b>Description</b></th>
    <th><b>Type</b></th>
    <th><b>Default</b></th>
  </tr>
</thead>
<tbody>
  <tr align="left">
    <td><code>cssvar.enable</code></td>
    <td>
      Enable/Disable extension for a workspace/folder
    </td>
    <td><code>boolean</code></td>
    <td><br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.files</code></td>
    <td>
      Relative/Absolute paths to CSS variable source files
    </td>
    <td><code>string[]</code></td>
    <td><br>
      <pre lang="js">["**/*.css"]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.ignore</code></td>
    <td>
      Relative/Absolute paths to file/folder sources to be ignored
    </td>
    <td><code>string[]</code></td>
    <td><br>
      <pre lang="js">["**/node_modules/**"]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.extensions</code>
      <br>Use language identifiers mentioned in <a href="https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers">this doc</a>
    </td>
    <td>File extensions in which IntelliSense will be enabled</td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[
  "css",
  "scss",
  "sass",
  "less",
  "postcss",
  "vue",
  "svelte",
  "astro",
  "ts",
  "tsx",
  "js",
  "jsx"
]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.themes</code>
      <br>Helps to bucket CSS variables based on themes used in any project
    </td>
    <td>
      <br>CSS Theme class names used in source files
      <br>E.g.<pre lang="js">["dark","dim"]</pre>
    </td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.excludeThemedVariables</code>
      <br>If <code>true</code>, hides duplicate theme variables from the list
    </td>
    <td>Exclude themed variables to remove unnecessary duplicates</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">false</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.disableSort</code>
      <br>Intellisense list won't be sorted
    </td>
    <td>Disables default sorting applied by VSCode</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">false</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.enableColors</code></td>
    <td>Enable VSCode's Color Representation feature when <code>true</code></td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.enableGotoDef</code></td>
    <td>Enable VSCode's Goto Definition feature for CSS Variable</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.enableHover</code></td>
    <td>Enable VScode's Hover IntelliSense feature for CSS Variables</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.postcssSyntax</code>
      <br>Details for this can be read here: <a href="./docs/customize-extension.md">Customize Extension</a>
    </td>
    <td>
      <br>Provides custom syntax parser for the mapped file extensions.
      <br>E.g.<pre lang="js">{
  "sugarss": ["sss"]
}</pre>
    </td>
    <td><code>Record&lt;string,string[]<br>&gt;</code></td>
    <td>
      <br>
      <pre lang="js">{}</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.postcssPlugins</code>
      <br>Provide PostCSS Plugins to support custom CSS features
    </td>
    <td>
      <br>E.g.
      <pre lang="js">["postcss-nested"]</pre>
      Or
      <pre lang="js">[[
  "postcss-nested",
  {"unwrap": ["phone"]}
]]</pre>
    </td>
        </td>
    <td><pre lang="ts">string[]
| [
    string,
    object
  ][]</pre></td>
    <td>
      <br>
      <pre lang="js">[]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.mode</code>
      <br>Enable/Disable CSS variable linting modes.
    </td>
    <td>
      <br>E.g.<pre lang="js">["error", {
  ignore: [
    "--dynamic",
    "dy[nN].*?c$"
  ]
}]</pre>
    </td>
    <td><pre lang="ts">string
| [
    string,
    {ignore: string[]}
  ]</pre></td>
    <td><br>
      <pre lang="js">"off"</pre>
      <br>
    </td>
  </tr>
</tbody>
</table>
<br/><br/>

</details>

<details>
<summary style="font-size: 1.25rem;">Supported Languages/Extensions</summary>

### CSS
Any file with extensions `.css` and `.postcss` will be treated as CSS file.

### SASS
Any file with extensiosn `.scss` and `sass` will be treated as SCSS and SASS files respectively.

### LESS
Any file with extension `.less` will be treated as LESS file.

### SVELTE
Any file with extension `.svelte` will be treated as Svelte file.

### VUE
Any file with extension `.vue` will be treated as Vue file.

### ASTRO
Any file with extension `.astro` will be treated as Astro file.

### JS
Any file with extension `.js` or `.jsx` will be treated as Javascript files.

### TS
Any file with extension `.ts` or `.tsx` will be treated as Typescript files.

---

To support more extension/languages where this extension can trigger
it's IntelliSense, [please raise a request](https://github.com/willofindie/vscode-cssvar/issues/new)

To enable this extension for less languages, use `cssvar.extensions` settings to override the defaults.
