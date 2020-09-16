[![NPM version](https://img.shields.io/npm/v/kotlin-playground.svg)](https://www.npmjs.com/package/arrow-playground)

# Arrow Playground

Component that creates Kotlin-aware, including the Arrow library, editors capable of running code from HTML block elements.

This is a fork of the original [Kotlin Playground](https://github.com/JetBrains/kotlin-playground) work done by JetBrains team:
* `master` branch keeps the same content
* `arrow` branch contains the customization for Arrow (default branch for this repository and target for pull requests)
* `1.21.1` branch contains the first customization for Arrow

## Preview

![Arrow Playground preview](preview.png "Arrow Playground")

## Develop and contribute

Run server from [kotlin-compiler-server](https://github.com/arrow-kt/kotlin-compiler-server):
```
./gradlew bootRun
```
From this repository:
1. Install required dependencies `yarn install`.
2. `yarn start` to start local development server at http://localhost:9001.

## Release

1. `yarn run build:all` to create production bundles.
2. Remove `dist/examples`
3. `npm publish --dry-run` to check the publication
4. `npm adduser`
5. `npm publish`

## Installation

### Load it from a CDN

Generate the library through the proper `npm` script, then host it and insert a `<script>` element into your page, specifying what elements should be converted in its `data-selector` attribute.

```html
<script src="https://unpkg.com/arrow-playground@1" data-selector="code"></script>
```

Or, if you need to separate process of loading/conversion, omit the `data-selector` attribute and use a second `<script>` element like this:

```html
<script src="https://unpkg.com/arrow-playground@1"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  ArrowPlayground('.code-blocks-selector');
});
</script>
```

It's necessary to set the server where the code will be sent to be compiled and run with the Arrow libraries. For that you can set the `data-server` attribute:

```html
<script src="https://unpkg.com/arrow-playground@1"
        data-selector="code"
        data-server="https://my-arrow-playground-server">
</script>
```

The custom playground server comes from [kotlin-compiler-server](https://github.com/arrow-kt/kotlin-compiler-server).

### Host your own instance

Install arrow-playground as dependency via NPM.

```bash
npm install arrow-playground -S
```

And then just use it in your code.

```js
// ES5
var playground = require('arrow-playground');

document.addEventListener('DOMContentLoaded', function() {
  playground('code'); // attach to all <code> elements
});


// ES6
import playground from 'arrow-playground';

document.addEventListener('DOMContentLoaded', () => {
  playground('code'); // attach to all <code> elements
});
```

### Use from plugins

1) [Kotlin Playground WordPress plugin](https://github.com/Kotlin/kotlin-playground-wp-plugin) — [WordPress](https://wordpress.com/) plugin which allows to embed interactive Kotlin playground to any post.
2) [Kotlin Playground Coursera plugin](https://github.com/AlexanderPrendota/kotlin-playground-coursera-plugin) — Allows embedding interactive Kotlin playground for [coursera](https://www.coursera.org/) lessons.
3) [Kotlin Playground Orchid plugin](https://orchid.netlify.com/plugins/OrchidSyntaxHighlighter#kotlin-playground) — Allows embedding interactive Kotlin playground in [Orchid](https://orchid.netlify.com/) documentation sites.

### Options

Kotlin Playground supports several events or server URL overwriting passing an additional `options` parameter on initialisation.

For example:
```js
function onChange(code) {
  console.log("Editor code was changed:\n" + code);
}

function onTestPassed() {
   console.log("Tests passed!");
}

const options = {
  server: 'https://my-arrow-playground-server',
  onChange: onChange,
  callback: callback(targetNode, mountNode)
};

playground('.selector', options)

```

**Events description:**

- `onChange(code)` — Fires every time the content of the editor is changed. Debounce time: 0.5s.
 _code_ — current playground code.

- `onCloseConsole` — Is called after the console's closed.

- `onOpenConsole` — Is called after the console's opened.

- `callback(targetNode, mountNode)` — Is called after playground's united.
 _targetNode_ — node with plain text before component initialization.
 _mountNode_  — new node with runnable editor.

- `getInstance(instance)` - Getting playground state API.

  ```js
  instance.state      // playground attributes, dependencies and etc.
  instance.nodes      // playground NodeElement.
  instance.codemirror // editor specification.
  instance.execute()  // function for executing code snippet.
  instance.getCode()  // function for getting code from snippet.
  ```

## Customizing editors

Use the following attributes on elements that are converted to editors to adjust their behavior.

- `args`: Command line arguments.

  ```html
  <code args="1 2 3">
  /*
  Your code here
  */
  </code>
  ```

- `auto-indent="true|false"`: Whether to use the context-sensitive indentation. Defaults to `false`.

- `theme="idea|darcula|default"`: Editor IntelliJ IDEA themes.

- `mode="kotlin|js|java|groovy|xml|c|shell|swift|obj-c"`: Different languages styles. Runnable snippets only with `kotlin`. Default to `kotlin`.

- `indent="4"`: How many spaces a block should be indented. Defaults to `4`.

- `lines="true|false"`: Whether to show line numbers to the left of the editor. Defaults to `false`.

- `from="5" to="10`: Create a part of code. Example `from` line 5 `to` line 10.

- `data-output-height="200"`: Set the iframe height in `px` in output. Use for target platform `canvas`.

- `match-brackets="true|false""`: Determines whether brackets are matched whenever the cursor is moved next to a bracket. Defaults to `false`.

## Supported keyboard shortcuts

  - Ctrl+Space		   — code completion
  - Ctrl+F9/Cmd+R	       — execute snippet
  - Ctrl+/		       — comment code
  - Ctrl+Alt+L/Cmd+Alt+L   — format code
  - Shift+Tab		   — decrease indent
