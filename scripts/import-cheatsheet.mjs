import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { unzipSync } from "fflate";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";

const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const hash = (data) => createHash("sha256").update(data).digest("hex");

export function renderCheatsheet(source) {
  // The supplied README uses indented fences inside HTML details. Convert only
  // presentation wrappers; everything inside a code fence stays literal text.
  let fence = null;
  const normalized = source
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
      if (fence) {
        const result = line.startsWith(fence.indent)
          ? line.slice(fence.indent.length)
          : line;
        if (
          match &&
          match[2][0] === fence.char &&
          match[2].length >= fence.length &&
          !match[3].trim()
        )
          fence = null;
        return result;
      }
      if (match) {
        fence = {
          indent: match[1],
          char: match[2][0],
          length: match[2].length,
        };
        return line.slice(match[1].length);
      }
      if (/^\s*<\/?(?:aside|details)>\s*$/.test(line)) return "";
      const summary = line.match(/^\s*<summary>(.*?)<\/summary>\s*$/);
      return summary ? `\n### ${summary[1]}\n` : line;
    })
    .join("\n");
  const renderer = new marked.Renderer();
  renderer.html = (token) => escape(token.text);
  const chunks = [];
  let group = "Introduction";
  for (const token of marked.lexer(normalized)) {
    if (token.type === "heading" && token.depth <= 2) {
      const title = new JSDOM(marked.parseInline(token.text)).window.document
        .body.textContent;
      if (token.depth === 1) group = title;
      chunks.push({ title, group, tokens: [] });
    }
    if (!chunks.length)
      chunks.push({ title: "Introduction", group, tokens: [] });
    chunks.at(-1).tokens.push(token);
  }
  return chunks.map(({ title, group, tokens }, index) => {
    const clean = sanitizeHtml(marked.parser(tokens, { renderer }), {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, "del"],
      allowedAttributes: { a: ["href", "title"], code: ["class"] },
      allowedSchemes: ["http", "https", "mailto"],
      allowProtocolRelative: false,
    });
    const doc = new JSDOM(`<body>${clean}</body>`).window.document;
    for (const a of doc.querySelectorAll("a[href]")) {
      a.rel = "noopener noreferrer";
      a.target = "_blank";
    }
    const text = doc.body.textContent;
    for (const pre of doc.querySelectorAll("pre")) {
      const wrapper = doc.createElement("div"),
        button = doc.createElement("button");
      wrapper.className = "walkthrough-command";
      button.className = "copy-command";
      button.type = "button";
      button.textContent = "Copy code";
      pre.replaceWith(wrapper);
      wrapper.append(button, pre);
    }
    return {
      id: `imported-${index + 1}`,
      title,
      group,
      text,
      html: doc.body.innerHTML,
    };
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (!process.argv[2])
    throw Error("Usage: node scripts/import-cheatsheet.mjs <ZIP>");
  const bytes = await readFile(process.argv[2]);
  const archive = unzipSync(bytes, {
    filter: (file) => {
      if (file.originalSize > 2_000_000)
        throw Error("Archive entry exceeds size limit");
      return file.name === "OSCP-Cheatsheet-main/README.md";
    },
  });
  const markdown = archive["OSCP-Cheatsheet-main/README.md"];
  if (!markdown)
    throw Error("Expected OSCP-Cheatsheet-main/README.md in supplied archive");
  const sections = renderCheatsheet(new TextDecoder().decode(markdown));
  const catalog = {
    archiveSha256: hash(bytes),
    sourceSha256: hash(markdown),
    sections,
  };
  await mkdir("public/oscp-cheatsheet", { recursive: true });
  await writeFile("public/oscp-cheatsheet/README.md", markdown);
  await writeFile(
    "src/reference/imported-cheatsheet.json",
    JSON.stringify(catalog, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      sections: sections.length,
      topics: new Set(sections.map((s) => s.group)).size,
      sourceSha256: catalog.sourceSha256,
    }),
  );
}
