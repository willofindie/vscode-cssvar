# Debug extension

Since `v1.4.1` this extension has started to log parser errors with line number details, so that
developers who are using this extension can help file better bugs with details on cause of the issue.
This will help maintainers of this extension to quickly resolve the issue, with provided reproduction
of the issue.

## Test the extension in isolation

- Disable all extensions
![Disable all extensions](https://user-images.githubusercontent.com/11786283/188285728-bc301bd4-89de-476e-aca0-9cbbeb5010e7.png)

- Enable just this extension: `phoenisx.cssvar`
<img width="686" alt="image" src="https://user-images.githubusercontent.com/11786283/188295886-5d6e29bf-8faf-497e-ad0b-3fc978e2ae86.png">

- Test if the extension works properly after this, if not please follow the steps from next section
- *You should enable all your installed extensions, once done testing the extension*
![Enable all extensions](https://user-images.githubusercontent.com/11786283/188285738-cc3dead9-2465-4690-8db1-c0c47bb2ab98.png)


## How to look into Console Errors/Warnings for this extension

### Step 1:

Open your deveoper tools form VSCode `Help` menu:

<img
  width="379"
  alt="toggle_dev_tools"
  src="https://user-images.githubusercontent.com/11786283/179458644-73f5a0f3-041a-4219-a40b-6cf0d8f3d48d.png"
/>

### Step 2:

Find the error/warning in the VSCode devtools view.
The error will have the following structure:

```ts
[Extension Host] {
  "name": "CssSyntaxError",
  "reason": string,
  "file": "path to file that failed to parse",
  "line": number, // Line number in the file where the parser failed
  "column": number, // Column number in the line above where the parser failed
  "endLine": number,
  "endColumn": number
}
```

> **Note:** CSSVar Extension v1.4.3 will add extension name for each of these logs printed
> by the extension, for it to be found easily.

Check the line/column number in the file path mentioned in the above error, and provide
those details when raising a new issue.

For e.g. check the following GIF, which demonstrates the error while parsing an SCSS file:

![parser-error](https://user-images.githubusercontent.com/11786283/179459517-0b96c2ad-bb3a-4cfe-b653-20be78d0d27e.gif)

In the above gif, the extension setup wasn't done properly for SASS/SCSS files, as mentioned
in [Custmize Extension](./customize-extension.md) doc.
Thus, the extension fails to parse [SASS Interpolation](https://sass-lang.com/documentation/interpolation).

This can be fixed if developer sets [postcss-scss](https://github.com/postcss/postcss-scss)
syntax for the parser, as defined in [Adding Support for Custom Syntax](./customize-extension.md#adding-support-for-any-new-sytax).
