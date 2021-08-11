# `rehype-shiki`

Highlight code blocks in html with [`shiki`](https://github.com/shikijs/shiki).

## How to install

```sh
yarn add shiki @stefanprobst/rehype-shiki
```

## How to use

This package is a [`rehype`](https://github.com/rehypejs/rehype) plugin.

To highlight code blocks in html:

````js
const unified = require("unified")
const fromHtml = require("rehype-parse")
const shiki = require("shiki")
const withShiki = require("@stefanprobst/rehype-shiki")
const toHtml = require("rehype-stringify")

const doc = "```js\nconst hello = 'World';\n```\n"

async function createProcessor() {
  const highlighter = await shiki.getHighlighter({ theme: "poimandres" })

  const processor = unified()
    .use(fromHtml)
    .use(withShiki, { highlighter })
    .use(toHtml)

  return processor
}

createProcessor()
  .then((processor) => processor.process(doc))
  .then((vfile) => {
    console.log(String(vfile))
  })
````

## Configuration

This plugin accepts a preconfigured `highlighter` instance created with
`shiki.getHighlighter`.

### Theme

You can either pass one of the
[built-in themes](https://github.com/shikijs/shiki/blob/master/docs/themes.md#all-themes)
as string, or load a custom theme (any TextMate/VS Code theme should work):

```js
// const gloom = await shiki.loadTheme(path.join(process.cwd(), 'gloom.json'))
// const gloom = require('./gloom.json')
const gloom = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "gloom.json"), "utf-8"),
)

const highlighter = await shiki.getHighlighter({ theme: gloom })

const processor = unified()
  .use(fromHtml)
  .use(withShiki, { highlighter })
  .use(toHtml)
```

### Supported languages

Languages which are not included in Shiki's
[built-in grammars](https://github.com/shikijs/shiki/blob/master/docs/languages.md#all-languages)
can be added as TextMate grammars:

```js
const sparql = {
  id: "sparql",
  scopeName: "source.sparql",
  // provide either `path` or `grammar`
  path: path.join(process.cwd(), "sparql.tmLanguage.json"),
  // grammar: JSON.parse(
  //   fs.readFileSync(path.join(process.cwd(), "sparql.tmLanguage.json")),
  // ),
}

const highlighter = await shiki.getHighlighter({
  langs: [...shiki.BUNDLED_LANGUAGES, sparql],
})

const processor = unified()
  .use(fromHtml)
  .use(withShiki, { highlighter })
  .use(toHtml)
```

Note that `langs` will substitute the default languages. To keep the built-in
grammars, concat `shiki.BUNDLED_LANGUAGES`.

### Unknown languages

Unknown languages are ignored by default. You can set
`ignoreUnknownLanguage: false` to throw an error when an unsupported language is
encountered.
