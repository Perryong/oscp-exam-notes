import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
export const revision = "dd03effbc624dbb8789fbd7775369769cec81a36";
export const repository =
  "https://github.com/Perryong/Writeups-and-Walkthroughs";
const raw = `https://raw.githubusercontent.com/Perryong/Writeups-and-Walkthroughs/${revision}/`;
export const articleId = (path) =>
  path.replace(/\.md$/i, "").replaceAll("/", "--").toLowerCase();
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "") || "section";
export function convertArticle(markdown, path, paths) {
  const prepared = markdown
    .replace(
      /\{%\s*(?:tab|code)\s+[^%]*title="([^"]+)"[^%]*%\}/g,
      (_m, title) => `\n\n**${title}**\n\n`,
    )
    .replace(
      /\{%\s*(?:content-ref|file)\s+(?:url|src)="([^"]+)"[^%]*%\}/g,
      (_m, url) => `\n[Related resource](${url})\n`,
    )
    .replace(/\{%\s*endcontent-ref\s*%\}/g, "")
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .replace(
      /\{%\s*(?:hint|endhint|tabs|endtabs|tab|endtab|code|endcode)[\s\S]*?%\}/g,
      "",
    )
    .replace(
      /\{%\s*embed\s+url="([^"]+)"\s*%\}/g,
      (_m, url) => `[External resource](${url})`,
    )
    .replace(/\{%\s*endembed\s*%\}/g, "");
  const clean = sanitizeHtml(marked.parse(prepared), {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "details",
      "summary",
      "del",
      "input",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width"],
      code: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      input: ["type", "checked", "disabled"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      input: () => ({
        tagName: "input",
        attribs: { type: "checkbox", disabled: "" },
      }),
    },
  });
  const document = new JSDOM(`<body>${clean}</body>`).window.document;
  const title =
    document.querySelector("h1")?.textContent?.trim() ||
    path.split("/").at(-1).replace(/\.md$/i, "").replaceAll("-", " ");
  const toc = [],
    used = new Set();
  for (const heading of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
    const explicit = /\s*\{#([^}]+)\}\s*$/.exec(heading.textContent);
    if (explicit)
      heading.textContent = heading.textContent.replace(explicit[0], "");
    const base = slug(explicit?.[1] || heading.textContent);
    let id = base,
      n = 2;
    while (used.has(id)) id = base + "-" + n++;
    used.add(id);
    heading.id = id;
    if (heading.tagName !== "H1")
      toc.push({
        id,
        title: heading.textContent,
        level: Number(heading.tagName[1]),
      });
  }
  for (const a of document.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (href.startsWith("#")) continue;
    const url = new URL(href, raw + path);
    const relative = url.href.startsWith(raw)
      ? decodeURIComponent(url.pathname.slice(new URL(raw).pathname.length))
      : null;
    if (relative && paths.has(relative))
      a.setAttribute("href", "/walkthroughs/" + articleId(relative) + url.hash);
    else {
      a.href = url.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  }
  for (const img of document.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (!src) {
      img.remove();
      continue;
    }
    img.src = new URL(src, raw + path).href;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.alt =
      img.getAttribute("alt") ||
      img.closest("figure")?.querySelector("figcaption")?.textContent ||
      `${title} screenshot`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "image-expand";
    button.setAttribute("aria-label", "Expand " + img.alt);
    if (img.parentElement?.tagName === "A") img.parentElement.replaceWith(img);
    img.replaceWith(button);
    button.append(img);
  }
  for (const pre of document.querySelectorAll("pre")) {
    const wrap = document.createElement("div");
    wrap.className = "walkthrough-command";
    pre.replaceWith(wrap);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-command";
    button.textContent = "Copy command";
    wrap.append(button, pre);
  }
  for (const table of document.querySelectorAll("table")) {
    const wrap = document.createElement("div");
    wrap.className = "walkthrough-table";
    table.replaceWith(wrap);
    wrap.append(table);
  }
  const text = document.body.textContent || "";
  return {
    id: articleId(path),
    path,
    title,
    category: path.split("/")[0],
    source: `${repository}/blob/${revision}/${path}`,
    html: document.body.innerHTML,
    toc,
    excerpt: text.replace(/\s+/g, " ").slice(0, 220),
    searchText: toc.map((h) => h.title).join(" "),
  };
}
async function main() {
  const response = await fetch(
    `https://api.github.com/repos/Perryong/Writeups-and-Walkthroughs/git/trees/${revision}?recursive=1`,
  );
  if (!response.ok) throw Error("GitHub tree: " + response.status);
  const tree = await response.json();
  if (tree.truncated) throw Error("Incomplete repository tree");
  const paths = new Set(
    tree.tree
      .filter(
        (f) =>
          f.type === "blob" &&
          f.path.endsWith(".md") &&
          f.path !== "SUMMARY.md",
      )
      .map((f) => f.path),
  );
  const queue = [...paths].sort(),
    articles = [];
  await mkdir("public/walkthroughs", { recursive: true });
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const path = queue.shift();
        const res = await fetch(raw + path);
        if (!res.ok) throw Error(path + ": " + res.status);
        const a = convertArticle(await res.text(), path, paths);
        await writeFile(`public/walkthroughs/${a.id}.json`, JSON.stringify(a));
        const { html, toc, ...entry } = a;
        articles.push(entry);
      }
    }),
  );
  articles.sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
  );
  await writeFile(
    "src/walkthroughs/catalog.json",
    JSON.stringify({ revision, repository, articles }, null, 2) + "\n",
  );
  console.log(
    `Imported ${articles.length} articles at ${revision}; images load on demand from pinned source.`,
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
