# [Brainstorming] Multi Root Workspace folders:

- VSCode doesn't provide any API to get configuration for active text document.
  - I mean, we need to manually map CSSVars to a variable that resolves to active folder and it's contents


Two ways a user can open VSCode:
- Without any workspace
- With multi-root Workspace

## Without any Workspace

As per this [doc](https://github.com/microsoft/vscode/wiki/Adopting-Multi-Root-Workspace-APIs#eliminating-rootpath)
`workspaceFolders` can be `undefined`. This is how our current code is written.

This is working fine and we do not have to worry about any config mapping to active root folder
in workspace

## With workspace:

We first need to change all our configuration variables that depend on currently Active folder
to generate CSS Variables, like `cssvar.files` to support resource scoped configs, i.e.
`cssvar.resource.files`.

To make the extension work with multi-roots, we need to trigger a function everytime on
`workspace.onDidOpenTextDocument` and change our Active Folder, which in turn should change
the active set of CSS Variables for that folder.

If the CSS Variables are not generated, generate them for this folder and set them to activeCSSVariables
, else we can re-use the cache.

I guess this will solve the issue.

# [Brainstorming] Parse variables from any JS/CSS file

First of all, I want to keep this feature experimental, because all the parsers used in this project
are battle tested.

If I create a new parser, something very similar to `postcss-safe-parser`, which can parse JS/CSS like
files properly, it would surely have some trade-offs which I am not aware of right now.
