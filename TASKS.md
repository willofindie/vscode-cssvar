# Tasks
- Implement Github Workflows to auto release with notes: check https://github.com/MylesBorins/node-osc
- Immediately trigger completion intellisense for CSS, where this extension triggers, and we are still on a valid string, i.e.
  after `:` and before `;`
  - This is required because VSCode triggers it's own intellisense in CSS files, when declarations are auto completed,
    which doesn't trigger the completion provider for this extension.
- Add support for CSS @property at-rule: https://developer.mozilla.org/en-US/docs/Web/CSS/@property
- `statsSync` used for cache invalidation needs to be improvised for failure cases
  - This can happen when a file is deleted and does not exist anymore.
- Add compatibility with https://github.com/enyancc/vscode-ext-color-highlight
- Precached files in file watcher, once removed from source css files (like from @import paths)
  still stays cached. Steps to reproduce:
  - Open `css-imports` project -> After the files are parsed, update any import for `open-props` with a new
    granular css import, like `open-props/red.min.css`.
  - Doing this still shows `open-props/open-props.min.css` in the autocomplete/definition-provider list.


## Notes:

- Good read to understand CSS Syntax: [Tokenizer and Parser](https://drafts.csswg.org/css-syntax/)
- Good vscode extension to take insights from
  - https://github.com/znck/grammarly/blob/main/package.json
