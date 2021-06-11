const fs = require('fs')
const fromHtml = require('rehype-parse')
const toHtml = require('rehype-stringify')
const shiki = require('shiki')
const unified = require('unified')
const withShiki = require('../src')

const fixture = fs.readFileSync(__dirname + '/fixtures/test.html', {
  encoding: 'utf-8',
})

async function createProcessor() {
  const highlighter = await shiki.getHighlighter({ theme: 'nord' })

  const processor = unified()
    .use(fromHtml, { fragment: true })
    .use(withShiki, { highlighter })
    .use(toHtml)

  return processor
}

it('highlights code blocks in html', async () => {
  const processor = await createProcessor()

  const vfile = await processor.process(fixture)

  expect(vfile.toString()).toMatchInlineSnapshot(`
    "<h1>Heading</h1>
    <p>Text</p>
    <pre class=\\"shiki language-js\\" style=\\"background-color: #2e3440ff\\"><code><span class=\\"line\\"></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">    </span><span style=\\"color: #81A1C1\\">const</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #D8DEE9\\">hello</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #81A1C1\\">=</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #ECEFF4\\">\\"</span><span style=\\"color: #A3BE8C\\">World</span><span style=\\"color: #ECEFF4\\">\\"</span></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">  </span></span></code></pre>
    <p>More text</p>
    "
  `)
})
