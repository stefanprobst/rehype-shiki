import { toString } from 'hast-util-to-string'
import { codeToHast } from 'shiki-renderer-hast'
import { visit } from 'unist-util-visit'

const MISSING_HIGHLIGHTER = `Please provide a \`shiki\` highlighter instance via \`options\`.

Example:

const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })
const processor = rehype().use(withShiki, { highlighter })
`

/**
 * @see https://github.com/mapbox/rehype-prism/blob/main/index.js
 */
function attacher(options = {}) {
  const highlighter = options.highlighter

  if (!highlighter) {
    throw new Error(MISSING_HIGHLIGHTER)
  }

  const loadedLanguages = highlighter.getLoadedLanguages()
  const ignoreUnknownLanguage =
    options.ignoreUnknownLanguage == null ? true : options.ignoreUnknownLanguage

  return transformer

  function transformer(tree) {
    visit(tree, 'element', visitor)

    function visitor(node, _index, parent) {
      if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
        return
      }

      let lang = getLanguage(node)

      if (ignoreUnknownLanguage && !loadedLanguages.includes(lang)) {
        lang = null
      }

      const code = codeToHast(highlighter, toString(node), lang)

      parent.properties = code.properties
      parent.children = code.children
    }
  }
}

function getLanguage(node) {
  const dataLanguage = node.properties.dataLanguage

  if (dataLanguage != null) {
    return dataLanguage
  }

  const className = node.properties.className || []

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === 'language-') {
      return classListItem.slice(9).toLowerCase()
    }
  }

  return null
}

export default attacher
