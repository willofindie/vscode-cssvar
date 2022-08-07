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
  - Supports parsing [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) only

<br>

## Adding support for a new Syntax

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
- Syntax parser for Lit templates in JS/TS source files:
  [postcss-lit](https://github.com/43081j/postcss-lit)

<br>
<br>

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




[syntax-list]: https://github.com/postcss/postcss#syntaxes
[sass-syntax]: https://github.com/AleshaOleg/postcss-sass
[nested-plugin]: https://github.com/postcss/postcss-nested
