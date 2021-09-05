import * as fs from 'fs'
import * as path from 'path'

import fromHtml from 'rehype-parse'
import toHtml from 'rehype-stringify'
import * as shiki from 'shiki'
import { unified } from 'unified'

import withShiki from '../src'

const fixtures = {
  known: fs.readFileSync(path.resolve('./test/fixtures/test.html'), {
    encoding: 'utf-8',
  }),
  none: fs.readFileSync(path.resolve('./test/fixtures/none.html'), {
    encoding: 'utf-8',
  }),
  unknown: fs.readFileSync(path.resolve('./test/fixtures/unknown.html'), {
    encoding: 'utf-8',
  }),
}

async function createProcessor(options = {}) {
  const highlighter = await shiki.getHighlighter({ theme: 'nord' })

  const processor = unified()
    .use(fromHtml, { fragment: true })
    .use(withShiki, { highlighter, ...options })
    .use(toHtml)

  return processor
}

it('highlights code block in html', async () => {
  const processor = await createProcessor()

  const vfile = await processor.process(fixtures.known)

  expect(String(vfile)).toMatchInlineSnapshot(`
    "<h1>Heading</h1>
    <p>Text</p>
    <pre class=\\"shiki\\" style=\\"background-color: #2e3440ff\\"><code><span class=\\"line\\"></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">    </span><span style=\\"color: #81A1C1\\">const</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #D8DEE9\\">hello</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #81A1C1\\">=</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #ECEFF4\\">\\"</span><span style=\\"color: #A3BE8C\\">World</span><span style=\\"color: #ECEFF4\\">\\"</span></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">  </span></span></code></pre>
    <p>More text</p>
    "
  `)
})

it('highlights code block in html when running synchronously', async () => {
  const processor = await createProcessor()

  const vfile = processor.processSync(fixtures.known)

  expect(String(vfile)).toMatchInlineSnapshot(`
    "<h1>Heading</h1>
    <p>Text</p>
    <pre class=\\"shiki\\" style=\\"background-color: #2e3440ff\\"><code><span class=\\"line\\"></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">    </span><span style=\\"color: #81A1C1\\">const</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #D8DEE9\\">hello</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #81A1C1\\">=</span><span style=\\"color: #D8DEE9FF\\"> </span><span style=\\"color: #ECEFF4\\">\\"</span><span style=\\"color: #A3BE8C\\">World</span><span style=\\"color: #ECEFF4\\">\\"</span></span>
    <span class=\\"line\\"><span style=\\"color: #D8DEE9FF\\">  </span></span></code></pre>
    <p>More text</p>
    "
  `)
})

it('ignores code block without language', async () => {
  const processor = await createProcessor()

  const vfile = await processor.process(fixtures.none)

  expect(String(vfile)).toMatchInlineSnapshot(`
    "<h1>Heading</h1>
    <p>Text</p>
    <pre class=\\"shiki\\" style=\\"background-color: #2e3440ff\\"><code><span class=\\"line\\"><span style=\\"color: #d8dee9ff\\">
        const hello = \\"World\\"
      </span></span></code></pre>
    <p>More text</p>
    "
  `)
})

it('ignores code block with unknown language', async () => {
  const processor = await createProcessor()

  const vfile = await processor.process(fixtures.unknown)

  expect(String(vfile)).toMatchInlineSnapshot(`
    "<h1>Heading</h1>
    <p>Text</p>
    <pre class=\\"shiki\\" style=\\"background-color: #2e3440ff\\"><code><span class=\\"line\\"><span style=\\"color: #d8dee9ff\\">
        const hello = \\"World\\"
      </span></span></code></pre>
    <p>More text</p>
    "
  `)
})

it('throws when code block has unknown language and ignoreUnknownLanguage is set to false', async () => {
  const processor = await createProcessor({ ignoreUnknownLanguage: false })

  return expect(processor.process(fixtures.unknown)).rejects.toThrow(
    'No language registration for unknown',
  )
})
