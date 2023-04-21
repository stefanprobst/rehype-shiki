import * as fs from "fs";
import * as path from "path";

import parseNumericRange from "parse-numeric-range";
import fromHtml from "rehype-parse";
import toHtml from "rehype-stringify";
import fromMarkdown from "remark-parse";
import toHast from "remark-rehype";
import * as shiki from "shiki";
import { unified } from "unified";

import withShiki from "../src/index.js";

const fixtures = {
	known: fs.readFileSync(path.resolve("./test/fixtures/test.html"), {
		encoding: "utf-8",
	}),
	dataAttribute: fs.readFileSync(path.resolve("./test/fixtures/data-attribute.html"), {
		encoding: "utf-8",
	}),
	none: fs.readFileSync(path.resolve("./test/fixtures/none.html"), {
		encoding: "utf-8",
	}),
	unknown: fs.readFileSync(path.resolve("./test/fixtures/unknown.html"), {
		encoding: "utf-8",
	}),
	markdown: fs.readFileSync(path.resolve("./test/fixtures/test.md"), {
		encoding: "utf-8",
	}),
	highlight: fs.readFileSync(path.resolve("./test/fixtures/highlight.html"), {
		encoding: "utf-8",
	}),
	highlightMd: fs.readFileSync(path.resolve("./test/fixtures/highlight.md"), {
		encoding: "utf-8",
	}),
	highlightMdCustom: fs.readFileSync(path.resolve("./test/fixtures/highlight-custom.md"), {
		encoding: "utf-8",
	}),
};

async function createProcessor(options = {}) {
	const highlighter = await shiki.getHighlighter({ theme: "nord" });

	const processor = unified()
		.use(fromHtml, { fragment: true })
		.use(withShiki, { highlighter, ...options })
		.use(toHtml);

	return processor;
}

async function createMarkdownProcessor(options = {}) {
	const highlighter = await shiki.getHighlighter({ theme: "nord" });

	const processor = unified()
		.use(fromMarkdown)
		.use(toHast)
		.use(withShiki, { highlighter, ...options })
		.use(toHtml);

	return processor;
}

it("highlights code block in html", async () => {
	const processor = await createProcessor();

	const vfile = await processor.process(fixtures.known);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"></span>
		<span class="line"><span style="color: #D8DEE9FF">    </span><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">hello</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">World</span><span style="color: #ECEFF4">"</span></span>
		<span class="line"><span style="color: #D8DEE9FF">  </span></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("highlights code block in html when running synchronously", async () => {
	const processor = await createProcessor();

	const vfile = processor.processSync(fixtures.known);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"></span>
		<span class="line"><span style="color: #D8DEE9FF">    </span><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">hello</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">World</span><span style="color: #ECEFF4">"</span></span>
		<span class="line"><span style="color: #D8DEE9FF">  </span></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("ignores code block without language", async () => {
	const processor = await createProcessor();

	const vfile = await processor.process(fixtures.none);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"><span style="color: #d8dee9ff"></span></span>
		<span class="line"><span style="color: #d8dee9ff">    const hello = "World"</span></span>
		<span class="line"><span style="color: #d8dee9ff">  </span></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("ignores code block with unknown language", async () => {
	const processor = await createProcessor();

	const vfile = await processor.process(fixtures.unknown);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"><span style="color: #d8dee9ff"></span></span>
		<span class="line"><span style="color: #d8dee9ff">    const hello = "World"</span></span>
		<span class="line"><span style="color: #d8dee9ff">  </span></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("throws when code block has unknown language and ignoreUnknownLanguage is set to false", async () => {
	const processor = await createProcessor({ ignoreUnknownLanguage: false });

	return expect(processor.process(fixtures.unknown)).rejects.toThrow(
		"No language registration for unknown",
	);
});

it("shows error message for missing highlighter option", async () =>
	expect(
		createProcessor({ highlighter: undefined }).then((processor) =>
			processor.process(fixtures.unknown),
		),
	).rejects.toThrow("Please provide a `shiki` highlighter instance via `options`."));

it("accepts language via data-language attribute", async () => {
	const processor = await createProcessor();

	const vfile = await processor.process(fixtures.dataAttribute);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"></span>
		<span class="line"><span style="color: #D8DEE9FF">    </span><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">hello</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">World</span><span style="color: #ECEFF4">"</span></span>
		<span class="line"><span style="color: #D8DEE9FF">  </span></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("correctly processes markdown content", async () => {
	const processor = await createMarkdownProcessor();

	const vfile = await processor.process(fixtures.markdown);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">hello</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">World</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line"></span></code></pre>
		<p>More text</p>"
	`);
});

it("adds optional line classes via data-highlight attribute", async () => {
	const processor = await createProcessor();

	const vfile = await processor.process(fixtures.highlight);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">one</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">'</span><span style="color: #A3BE8C">One</span><span style="color: #ECEFF4">'</span></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">two</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">'</span><span style="color: #A3BE8C">Two</span><span style="color: #ECEFF4">'</span></span>
		<span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">three</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">'</span><span style="color: #A3BE8C">Three</span><span style="color: #ECEFF4">'</span></span>
		<span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">four</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">'</span><span style="color: #A3BE8C">Four</span><span style="color: #ECEFF4">'</span></span>
		<span class="line"></span></code></pre>
		<p>More text</p>
		"
	`);
});

it("adds optional line classes via markdown code block meta", async () => {
	const processor = await createMarkdownProcessor();

	const vfile = await processor.process(fixtures.highlightMd);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">one</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">One</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">two</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Two</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">three</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Three</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">four</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Four</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line"></span></code></pre>
		<p>More text</p>"
	`);
});

it("adds optional line classes via markdown custom parsed code block meta", async () => {
	const processor = await createMarkdownProcessor({
		getLineOptions(node) {
			if (node.data && node.data.meta) {
				const meta = node.data.meta.replace(/{(.*?)}/, "$1");
				return parseNumericRange(meta).map((line) => {
					return { line, classes: ["highlighted"] };
				});
			}
			return undefined;
		},
	});

	const vfile = await processor.process(fixtures.highlightMdCustom);

	expect(String(vfile)).toMatchInlineSnapshot(`
		"<h1>Heading</h1>
		<p>Text</p>
		<pre class="shiki" style="background-color: #2e3440ff"><code><span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">one</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">One</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">two</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Two</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line highlighted"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">three</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Three</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line"><span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">four</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">Four</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span></span>
		<span class="line"></span></code></pre>
		<p>More text</p>"
	`);
});
