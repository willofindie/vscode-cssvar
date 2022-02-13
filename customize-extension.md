# Customize the Extension

> Before reading the doc, do keep in mind with more features comes more responsibility :stuck_out_tongue_winking_eye:. CSS and Browsers have come a long way, and even the basic CSS has a lot of features now a days. The plugin can perfectly work with plain CSS and there is no need for customizations.
>
> *Customizations is required for legacy projects which are already heavily dependent on custom CSS Extensions and features provided by various tools like SASS preprocessor and more.*

`phoenisx.cssvar` internally uses [postcss](https://github.com/postcss/postcss) to parse and
find css variables.
Post `cssvar v1.1`, this extension supports `postcss` own plugins and syntax providers
to enhance the ability of this extension.

Previously this extension worked only with pure CSS3 spec files, and support for other
CSS Extensions like `Sass`/`Scss`/`Less` was not in the roadmap, but now this extension
can be customised as per user's own needs.

You can find list of `postcss` plugins and syntax,
[here][plugin-list] and
[here][syntax-link] respectively.

> NOTE: There's a limit to supported CSS Extensions for now. Supported list of CSS Extensions are:
> - `Sass`: using [postcss-sass][sass-syntax]
> - `Scss`: using [postcss-sass][scss-syntax]
> - `Less`: using [postcss-less][less-syntax]

## Adding support for any new Sytax

First install any syntax from list provided [here][syntax-list].
For e.g. read the following to add support for `Sass` CSS Extension.

Install [postcss-sass][sass-syntax] npm module on your system:

```sh
yarn add -D postcss-sass

# Or install it globally
yarn global add postcss-sass
```

Once the above is done, edit your `cssvar` config to use this syntax:

```json
{
  "cssvar.files": ["src/styles/variables/index.sass"],
  "cssvar.extensions": ["css", "sass"],
  "cssvar.postcssSyntax": ["postcss-sass"]
}
```

## Enhanced CSS using Postcss Plugins:

Install any plugin from list provided [here][plugin-list].
For e.g. read the following to add support for `nesting` in CSS files listed in `cssvar.files`.

Install [postcss-nested][nested-plugin] npm module on your system:

```sh
yarn add -D postcss-nested

# Or install it globally
yarn global add postcss-nested
```

Once the above is done, edit your `cssvar` config to use this syntax:

```json
{
  "cssvar.files": ["src/styles/variables/index.scss"],
  "cssvar.extensions": ["css", "scss"],
  "cssvar.postcssPlugins": ["postcss-nested"]
}
```

[syntax-list]: https://github.com/postcss/postcss#syntaxes
[plugin-list]: https://github.com/postcss/postcss#plugins
[sass-syntax]: https://github.com/AleshaOleg/postcss-sass
[scss-syntax]: https://github.com/postcss/postcss-scss
[less-syntax]: https://github.com/webschik/postcss-less
[nested-plugin]: https://github.com/postcss/postcss-nested
