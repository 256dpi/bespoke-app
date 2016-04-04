# Bespoke.app

The Bespoke.app allows you to present [bespoke.js](https://github.com/bespokejs/bespoke) based presentations on a second screen while having a Keynote-like presenter screen on your main screen. The presenter screens shows the next slide next to the current slide and displays some presenter notes below them.

**Nothing will ever force you again to use Keynote.**

![Screenshot](http://joel-github-static.s3.amazonaws.com/bespoke-app/screenshot.png)

## Get Started

Download the latest version from [releases](https://github.com/256dpi/bespoke-app/releases) and install it to your Applications folder.

Update your presentation to export the deck:

```js
window.deck = bespoke.from();
```

Define a default background color:

```stylus
body
  background-color: white
```

Rebuild the presentation and drag the generated `dist/index.html` on the applications start screen.

If you have only one screen connected, "Toggle Presentation" will just create a second window that allows you to test your presentation.

If you have two screens connected, "Toggle Presentation" will show the presentation in fullscreen on the second monitor.

## Presenter Notes

Bespoke.app will search for the first child element of the current slide with the `notes` class to populate the presenter notes area. You can hide the notes from your presentation using CSS.
