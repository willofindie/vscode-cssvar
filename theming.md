# CSS Theming

> NOTE: Theming in CSS can be complicated, and I am still figuring out how to properly support themed variables, so that duplication in Autocomplete list is as minimal as possible. In future, I am planning to hide unnessary variables from the list, defined by user, completely. This will help scoping variables so that developers do not use variables which are not supposed to be used or tweaked.
>
> This feature can be benefitted in adding a liniting support for used CSS variables.

Theming in any project can be implemented in various ways. This plugin will support two ways of
theming, since I feel they are the most suitable ways of theming using CSS variables.

- Using Classes (Supported in extension)
- Using Color Schemes (Not supported yet)


## Theming using CSS classes

```css
:root {
  /* Provide Generic variables here */
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #EEEEEE;
  --color-gray-300: #E0E0E0;
  --color-gray-800: #424242;
  --color-gray-900: #212121;
  --color-purple-100: #D1C4E9;
  --color-purple-200: #B39DDB;
  --color-purple-500: #6200EE;
  --color-purple-700: #3700B3;
}

body {
  --text: var(--color-gray-900);
  --disabled-text: var(--color-gray-300);
  --primary: var(--color-purple-500);
  --primary-dark: var(--color-purple-700);
}

body.dark {
  --text: var(--color-gray-50);
  --disabled-text: var(--color-gray-200);
  --primary: var(--color-purple-100);
  --primary-dark: var(--color-purple-200);
}


.usage-btn {
  /* Will switch when parent body class changes to .dark */
  color: var(--text);
  background: var(--primary);
}
```

Support for this style of theming is present in current version of this extension.
Enabling theme support in Extension helps removing duplicate CSS variables from the
Autocomplete list, making sure the list doesn't grow unnecessarily.

### Extension Config

Following feature is still improving, and will change in future. Use the below config, if you have
too many duplicates in your autocomplete list, due to theming.

```jsonc
{
  /* Let Extension know there exists a `.dark` theme  */
  "cssvar.themes": ["dark", "dim"],
  /* If the below config is true, css variables from `.dark` and `.dim` theme will be hidden from list */
  "cssvar.excludeThemedVariables": true
}
```


## Theming using CSS `color-scheme` property

Read the article here: [Building a Color Scheme](https://web.dev/building-a-color-scheme/)
This is a more robust way of theming Website using CSS variables, but support for this theming
will come in a future release.

```html
<!DOCTYPE html>
<html dir="ltr" color-scheme="light" lang="en">
</html>
```

```css
:root {
  --brand-hue: 200;
  --brand-saturation: 100%;
  --brand-lightness: 50%;
}

/**
 * Defines the auto scheme, i.e. when html does not has any
 * `color-scheme` attribute set.
 */
:root {
  color-scheme: light;
  --brand: hsl(
    var(--brand-hue)
    var(--brand-saturation)
    var(--brand-lightness)
  );
  --text1: hsl(var(--brand-hue) var(--brand-saturation) 10%);
}

/**
 * Following media query helps take in OS's default color scheme
 * i.e. on Mac if the theme is set to Dark, the browser will enable the
 * following color scheme, overriding the light ones.
 */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --brand: hsl(
      var(--brand-hue)
      calc(var(--brand-saturation) / 2)
      calc(var(--brand-lightness) / 1.5)
    );
    --text1: hsl(var(--brand-hue) 15% 85%);
  }
}

[color-scheme="dark"] {
  color-scheme: dark;
  --brand: hsl(
    var(--brand-hue)
    calc(var(--brand-saturation) / 2)
    calc(var(--brand-lightness) / 1.5)
  );
  --text1: hsl(var(--brand-hue) 15% 85%);
}

[color-scheme="dim"] {
  color-scheme: dark;
  --brand: hsl(
    var(--brand-hue)
    calc(var(--brand-saturation) / 1.25)
    calc(var(--brand-lightness) / 1.25)
  );
  --text1: hsl(var(--brand-hue) 15% 75%);
}
```
