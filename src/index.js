const parse = require('hast-util-raw')
const toString = require('hast-util-to-string')
const shiki = require('shiki')
const visit = require('unist-util-visit')

/**
 * @see https://github.com/mapbox/rehype-prism/blob/main/index.js
 */
function attacher(options = {}) {
  const theme = options.theme !== undefined ? options.theme : 'nord'

  return transformer

  async function transformer(tree) {
    /**
     * Since `getHighlighter` is async, this means that the `unified` processor
     * cannot be run with `processSync`. We could accept a `shiki` instance via
     * plugin options to get around this.
     */
    const highlighter = await shiki.getHighlighter({ theme })

    visit(tree, 'element', visitor)

    function visitor(node, _index, parent) {
      if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
        return
      }

      const lang = getLanguage(node)

      if (lang === null) {
        return
      }

      try {
        /**
         * There probably is a better way than parsing the html string returned by shiki.
         * E.g. generate hast with `hastscript` from tokens returned by `highlighter.codeToThemedTokens`.
         */
        const code = parse({
          type: 'raw',
          value: highlighter.codeToHtml(toString(node), lang),
        })

        parent.properties = code.properties
        parent.children = code.children

        parent.properties.className = (
          parent.properties.className || []
        ).concat('language-' + lang)
      } catch (err) {
        if (options.ignoreMissing && /Unknown language/.test(err.message)) {
          return
        }

        throw err
      }
    }
  }
}

function getLanguage(node) {
  const className = node.properties.className || []

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === 'language-') {
      return classListItem.slice(9).toLowerCase()
    }
  }

  return null
}

module.exports = attacher
