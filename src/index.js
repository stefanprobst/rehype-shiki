import { toString } from "hast-util-to-string";
import json5 from "json5";
import parseNumericRange from "parse-numeric-range";
import { codeToHast } from "shiki-renderer-hast";
import { visit } from "unist-util-visit";

const MISSING_HIGHLIGHTER = `Please provide a \`shiki\` highlighter instance via \`options\`.

Example:

const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })
const processor = rehype().use(withShiki, { highlighter })
`;

/**
 * @see https://github.com/mapbox/rehype-prism/blob/main/index.js
 */
function attacher(options = {}) {
	const highlighter = options.highlighter;

	if (!highlighter) {
		throw new Error(MISSING_HIGHLIGHTER);
	}

	const loadedLanguages = highlighter.getLoadedLanguages();
	const ignoreUnknownLanguage =
		options.ignoreUnknownLanguage == null ? true : options.ignoreUnknownLanguage;

	return transformer;

	function transformer(tree) {
		visit(tree, "element", visitor);

		function visitor(node, _index, parent) {
			if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
				return;
			}

			let lang = getLanguage(node);

			if (ignoreUnknownLanguage && !loadedLanguages.includes(lang)) {
				lang = null;
			}

			const getLineOptions = options.getLineOptions || getLineOptionsDefault;
			const lineOptions = getLineOptions(node);
			const code = codeToHast(highlighter, toString(node), lang, undefined, {
				lineOptions,
			});

			parent.properties = code.properties;
			parent.children = code.children;
		}
	}
}

function getLanguage(node) {
	const dataLanguage = node.properties.dataLanguage;

	if (dataLanguage != null) {
		return dataLanguage;
	}

	const className = node.properties.className || [];

	for (const classListItem of className) {
		if (classListItem.slice(0, 9) === "language-") {
			return classListItem.slice(9).toLowerCase();
		}
	}

	return null;
}

function getLineOptionsDefault(node) {
	const dataHighlight = node.properties.dataHighlight;

	if (dataHighlight != null) {
		try {
			const lineNumbers = parseNumericRange(dataHighlight);
			return lineNumbers.map((line) => {
				return { line, classes: ["highlighted"] };
			});
		} catch {
			return undefined;
		}
	}

	const meta = node.data != null ? node.data.meta : undefined;

	if (meta != null) {
		try {
			const parsed = json5.parse(node.data.meta);
			if (parsed.highlight != null) {
				const lineNumbers = parseNumericRange(parsed.highlight);
				return lineNumbers.map((line) => {
					return { line, classes: ["highlighted"] };
				});
			}
		} catch {
			return undefined;
		}
	}

	return undefined;
}

export default attacher;
