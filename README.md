# `rehype-shiki`

Highlight code blocks in html with [`shiki`](https://github.com/shikijs/shiki).

## How to install

```sh
yarn add @stefanprobst/rehype-shiki
```

## How to use

This package is a [`rehype`](https://github.com/rehypejs/rehype) plugin.

Note that `shiki` only runs async, so you must use the `process`, not the
`processSync` method on your [`unified`](https://github.com/unifiedjs/unified)
processor.

To highlight code blocks in html:

````js
const unified = require("unified")
const fromHtml = require("rehype-parse")
const withShiki = require("@stefanprobst/rehype-shiki")
const toHtml = require("rehype-stringify")

const doc = "```js\nconst hello = 'World';\n```\n"

const processor = unified().use(fromHtml).use(withShiki).use(toHtml)

processor.process(doc).then((vfile) => {
  console.log(vfile.toString())
})
````

## Options

You can pass a custom
[`theme`](https://github.com/shikijs/shiki/blob/master/docs/themes.md) (any VS
Code theme should work):

```js
const processor = unified()
  .use(fromHtml)
  .use(withShiki, { theme: "gloom" })
  .use(toHtml)
```
