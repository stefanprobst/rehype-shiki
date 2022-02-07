# `rehype-shiki`

Highlight code blocks in html with [`shiki`](https://github.com/shikijs/shiki).

## How to install

```sh
yarn add shiki @stefanprobst/rehype-shiki
```

## How to use

This package is a [`rehype`](https://github.com/rehypejs/rehype) plugin.

To highlight code blocks in html, specify the code block language via
`data-language` attribute on the `<code>` element:

```js
import withShiki from '@stefanprobst/rehype-shiki'
import fromHtml from 'rehype-parse'
import toHtml from 'rehype-stringify'
import * as shiki from 'shiki'
import { unified } from 'unified'

const doc = '<pre><code data-language="js">const hello = "World";</code></pre>'

async function createProcessor(options = {}) {
  const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })

  const processor = unified()
    .use(fromHtml)
    .use(withShiki, { highlighter, ...options })
    .use(toHtml)

  return processor
}

createProcessor()
  .then((processor) => processor.process(doc))
  .then((vfile) => {
    console.log(String(vfile))
  })
```

When used in a `unified` pipeline coming from Markdown, specify the code block
language via code block meta:

````js
import withShiki from '@stefanprobst/rehype-shiki'
import toHtml from 'rehype-stringify'
import fromMarkdown from 'remark-parse'
import toHast from 'remark-rehype'
import * as shiki from 'shiki'
import { unified } from 'unified'

const doc = "```js\nconst hello = 'World';\n```\n"

async function createProcessor(options = {}) {
  const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })

  const processor = unified()
    .use(fromMarkdown)
    .use(toHast)
    .use(withShiki, { highlighter, ...options })
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
  fs.readFileSync(path.join(process.cwd(), 'gloom.json'), 'utf-8'),
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
  id: 'sparql',
  scopeName: 'source.sparql',
  // provide either `path` or `grammar`
  path: path.join(process.cwd(), 'sparql.tmLanguage.json'),
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

### Highlight lines

It is possible to add additional classes to specific lines. By default, a
`highlighted` class will be added for line ranges defined like this:

```html
<pre><code data-language="js" data-highlight="2..3"
>function hi() {
  console.log('Hi!')
  return true
}</code></pre>
```

or

````md
```js {highlight: '2..3'}
function hi() {
  console.log('Hi!')
  return true
}
```
````

You can adjust this by providing a custom `getLineOptions` function:

```js
processor.use(withShiki, {
  highlighter,
  getLineOptions(node) {
    /** Access any data attributes via `node.properties`, and markdown code block metadata via `node.data.meta`. */
    return [{ line: 2: classes: ['highlighted']}]
  }
})
```
