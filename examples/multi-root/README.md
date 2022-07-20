# Brief

Multi Root support for CSS variables is pretty new, released with `v1.5`.
Support for CSS variables is pretty similar to single folder support in VSCode.

Some differences from single folder approach are mentioned below:

- Some of the extension settings can be either set for the entire project or specific to each root folder
- Switching between CSS files from different Root folders requires file updates for the extension to
  trigger again.
  - Not sure why this happens, but will try to figure out a fix (if present) in upcoming releases.
