# Customize the Extension

`phoenisx.cssvar` internally uses [PostCSS](https://github.com/postcss/postcss) to parse and
find CSS variables. Use [PostCSS syntax parsers][syntax-list] to add support for your
desired CSS syntax.

<br>

## Already supported source files

The following list of source file extensions does not need any customization.
`cssvar` already has in-built support for them.

- CSS or CSS-like files: `css`, `scss`, `less`.
- JS or JS-like files: `js`, `jsx`, `ts`, `tsx`.
  - Statically parses [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). No customization needed

> `cssvar` has minimal support for parsing JS/TS files.
> __*This won't be required, but in case you face issues with*__
> __*JS/TS source file parsing try*__
> __*using [postcss-css-in-js][css-in-js] parser,*__
> __*as described in the [following section](#example-ii)*__.

<br><br>

## Adding support for a new syntax

> ***For customizations to work, you need to have
[postcss](https://github.com/postcss/postcss) `v8+` installed in your local project's `node_modules`.***

First, install any syntax parser from the list provided [here][syntax-list]
or from the list below.

**List of PostCSS syntax libraries**
- Syntax Parser for Sass source files:
  [postcss-sass][sass-syntax]
- Syntax Parser for HTML source files:
  [postcss-html](https://github.com/gucong3000/postcss-html)
- Syntax Parser for SugarSS source files:
  [sugarss](https://github.com/postcss/sugarss)
- Syntax Parser for [Stylus](https://stylus-lang.com/) CSS extension:
  [postcss-styl](https://github.com/stylus/postcss-styl)
- Syntax parser for `css-in-js` in JS/TS source files:
  [postcss-css-in-js][css-in-js]
- Syntax parser for Lit templates in JS/TS source files:
  [postcss-lit](https://github.com/43081j/postcss-lit)

<br>

### Example I

The following example helps demonstrate adding support for `sass` CSS Extension.
<br>Install [postcss-sass][sass-syntax] package on your system:

```sh
yarn add -D postcss postcss-sass
```

Once the above is done, edit your `cssvar` config to use this syntax:

```jsonc
// .vscode/settings.json
{
  "cssvar.postcssSyntax": {
    // [npm package name]: ["file extension list to use this syntax parser for"]
    "postcss-sass": ["sass"]
  }
}
```

<br>

### Example II

The following example helps demonstrate adding support for `css-in-js` parsing support.
<br>Install [postcss-css-in-js][css-in-js] and [postcss-syntax](https://github.com/gucong3000/postcss-syntax) packages
on your system:

```sh
yarn add -D postcss postcss-syntax @stylelint/postcss-css-in-js
```

Once the above is done, edit your `cssvar` config to use this syntax:

```jsonc
// .vscode/settings.json
{
  "cssvar.postcssSyntax": {
    "postcss-syntax": ["js", "jsx", "ts", "tsx"]
  }
}
```

To see this setup working, uncomment this syntax in [js-parser example][js-parser-eg-line-link]


[syntax-list]: https://github.com/postcss/postcss#syntaxes
[sass-syntax]: https://github.com/AleshaOleg/postcss-sass
[nested-plugin]: https://github.com/postcss/postcss-nested
[css-in-js]: https://github.com/stylelint/postcss-css-in-js
[js-parser-eg-line-link]: https://github.com/willofindie/vscode-cssvar/blob/main/examples/js-parser/.vscode/settings.json#L6
