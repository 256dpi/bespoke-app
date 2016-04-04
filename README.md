# Bespoke.app

## Caveats

Using electron will make some libraries detect the environment as require.js.

```jade
script(src='https://code.jquery.com/jquery-2.2.2.min.js' onload="if(window.module) { window.$ = window.jQuery = window.module.exports; }")
```
