# Tasks
- Implement Github Workflows to auto release with notes: check https://github.com/MylesBorins/node-osc
- Immediately trigger completion intellisense for CSS, where this extension triggers, and we are still on a valid string, i.e.
  after `:` and before `;`
  - This is required because VSCode triggers it's own intellisense in CSS files, when declarations are auto completed,
    which doesn't trigger the completion provider for this extension.
- Add support for CSS @property at-rule: https://developer.mozilla.org/en-US/docs/Web/CSS/@property


## Notes:

- Good read to understand CSS Syntax: [Tokenizer and Parser](https://drafts.csswg.org/css-syntax/)
- Good vscode extension to take insights from
  - https://github.com/znck/grammarly/blob/main/package.json
