# Customize the Extension

`phoenisx.cssvar` internally uses [PostCSS](https://github.com/postcss/postcss) to parse and
find CSS variables. Use custom PostCSS syntax parsers to add support for your
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

First, install any syntax parser from the list provided [here][syntax-list].
The following example helps demonstrate adding support for `sass` CSS Extension.


Install [postcss-sass][sass-syntax] package on your system:

```sh
yarn add -D postcss @csstools/postcss-sass
```

Once the above is done, edit your `cssvar` config to use this syntax:

```jsonc
// .vscode/settings.json
{
  "cssvar.postcssSyntax": {
    "postcss-sass": ["sass"]
  }
}
```


[syntax-list]: https://github.com/postcss/postcss#syntaxes
[sass-syntax]: https://github.com/csstools/postcss-sass
[nested-plugin]: https://github.com/postcss/postcss-nested
