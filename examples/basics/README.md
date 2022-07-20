# Brief

This extension works flawlessly with pure CSS projects.
No settings required for pure CSS projects, but you can customize the settings if needed.

**NOTE ::**
By default, when not settings is provided, this extension will scan all CSS files in current project.
This is fine for smaller projects, but is not recommended for larger projects, since scanning and parsing
a huge list of css files can make the extension slow and might not be desirable.

Thus, it is recommended to at-least set `cssvar.files` settings for your projects.
