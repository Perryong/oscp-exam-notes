import { unzipSync } from "fflate";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";

const digest = (data) => createHash("sha256").update(data).digest("hex");
const route = (id) => `/knowledge-vault/hacker-docs--source-${id}`;
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "") || "section";

export function importArchive(bytes) {
  let size = 0;
  const entries = unzipSync(bytes, {
    filter: (file) => {
      if (
        file.name.includes("\\") ||
        file.name.startsWith("/") ||
        file.name.split("/").includes("..")
      )
        throw Error("Unsafe archive path");
      size += file.originalSize;
      if (file.originalSize > 20_000_000 || size > 100_000_000)
        throw Error("Archive is too large");
      return /\.(md|png)$/i.test(file.name);
    },
  });
  const files = new Map();
  for (const [name, data] of Object.entries(entries)) {
    const path = name.replace(/^[^/]+\//, "");
    if (path.startsWith("content/") || path === "README.md")
      files.set(path, data);
  }
  const paths = [...files.keys()];
  const notePaths = paths
    .filter((p) => p.startsWith("content/") && p.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (!notePaths.length) throw Error("No content Markdown files found");
  const ids = new Map(notePaths.map((p) => [p, digest(p).slice(0, 16)]));
  const images = {},
    imagePaths = new Map();
  for (const path of paths.filter((p) => p.toLowerCase().endsWith(".png"))) {
    const data = files.get(path);
    if (Buffer.from(data.subarray(0, 8)).toString("hex") !== "89504e470d0a1a0a")
      throw Error(`Invalid PNG: ${path}`);
    const filename = `${digest(data).slice(0, 24)}.png`;
    images[filename] = data;
    imagePaths.set(path, `/hacker-docs/images/${filename}`);
  }
  const repairs = [],
    missingImages = [],
    articles = {},
    markdown = {},
    notes = [];
  const renderer = new marked.Renderer();
  // HTML in these security notes is source material, never live page markup.
  renderer.html = (token) => escape(token.text);
  for (const path of notePaths) {
    const id = ids.get(path),
      source = new TextDecoder().decode(files.get(path));
    const rendered = marked.parse(source, { renderer });
    const clean = sanitizeHtml(rendered, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "del"],
      allowedAttributes: {
        a: ["href", "title"],
        img: ["src", "alt", "title"],
        code: ["class"],
        th: ["colspan", "rowspan"],
        td: ["colspan", "rowspan"],
      },
      allowedSchemes: ["https", "http", "mailto"],
      allowProtocolRelative: false,
    });
    const doc = new JSDOM(`<body>${clean}</body>`).window.document;
    const toc = [],
      used = new Set();
    for (const heading of doc.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
      const base = slug(heading.textContent);
      let anchor = base,
        n = 2;
      while (used.has(anchor)) anchor = `${base}-${n++}`;
      used.add(anchor);
      heading.id = anchor;
      toc.push({
        id: anchor,
        title: heading.textContent,
        level: Number(heading.tagName.slice(1)),
      });
    }
    function resolveLocal(href) {
      let decoded;
      try {
        decoded = decodeURIComponent(href.split(/[?#]/)[0]);
      } catch {
        return null;
      }
      const target = decoded.startsWith("content/")
        ? posix.normalize(decoded)
        : posix.normalize(posix.join(posix.dirname(path), decoded));
      if (files.has(target)) return target;
      const matches = paths.filter(
        (p) => p.toLowerCase() === target.toLowerCase(),
      );
      if (matches.length === 1) {
        repairs.push({ path, reference: href, resolved: matches[0] });
        return matches[0];
      }
      return null;
    }
    for (const a of doc.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (href.startsWith("#")) continue;
      if (/^https?:|^mailto:/i.test(href)) {
        a.rel = "noopener noreferrer";
        a.target = "_blank";
        continue;
      }
      const local = resolveLocal(href);
      if (ids.has(local))
        a.href =
          route(ids.get(local)) +
          (href.includes("#") ? `#${href.split("#")[1]}` : "");
      else if (imagePaths.has(local)) a.href = imagePaths.get(local);
      else {
        a.removeAttribute("href");
        a.title = "Link target is not included in the supplied archive";
      }
    }
    let imageCount = 0;
    for (const img of doc.querySelectorAll("img")) {
      const href = img.getAttribute("src") || "",
        local = resolveLocal(href),
        url = imagePaths.get(local);
      if (!url) {
        missingImages.push({ path, reference: href });
        const missing = doc.createElement("p");
        missing.textContent = `Image not included in supplied archive: ${img.alt || href}`;
        img.replaceWith(missing);
        continue;
      }
      imageCount++;
      img.src = url;
      img.loading = "lazy";
      img.decoding = "async";
      img.alt ||= `${posix.basename(path, ".md")} screenshot ${imageCount}`;
      if (img.parentElement?.tagName === "A")
        img.parentElement.replaceWith(img);
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "image-expand";
      button.setAttribute("aria-label", `Expand ${img.alt}`);
      img.replaceWith(button);
      button.append(img);
    }
    const text = doc.body.textContent || "";
    for (const pre of doc.querySelectorAll("pre")) {
      const wrap = doc.createElement("div"),
        copy = doc.createElement("button");
      wrap.className = "walkthrough-command";
      copy.type = "button";
      copy.className = "copy-command";
      copy.textContent = "Copy code";
      pre.replaceWith(wrap);
      wrap.append(copy, pre);
    }
    for (const table of doc.querySelectorAll("table")) {
      const wrap = doc.createElement("div");
      wrap.className = "walkthrough-table";
      table.replaceWith(wrap);
      wrap.append(table);
    }
    const parts = path.split("/");
    const title =
      parts.slice(3).join(" / ").replace(/\.md$/, "") ||
      posix.basename(path, ".md");
    const category = parts[1],
      group = parts[3] || category;
    notes.push({
      id,
      path,
      title,
      category,
      group,
      imageCount,
      searchText: text,
      sha256: digest(files.get(path)),
    });
    articles[id] = { html: doc.body.innerHTML, toc };
    markdown[id] = files.get(path);
  }
  return {
    catalog: {
      archiveSha256: digest(bytes),
      author: "ghostware0x00",
      fork: "Perryong/Hacker-DOCS",
      notes,
      imageCount: imagePaths.size,
      imageFiles: Object.keys(images),
      repairs,
      missingImages,
    },
    articles,
    markdown,
    images,
    readme: files.get("README.md"),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (!process.argv[2])
    throw Error("Usage: node scripts/import-hacker-docs.mjs <zip>");
  const imported = importArchive(await readFile(process.argv[2]));
  const root = "public/hacker-docs";
  await mkdir(`${root}/images`, { recursive: true });
  for (const [id, article] of Object.entries(imported.articles))
    await writeFile(`${root}/${id}.json`, JSON.stringify(article));
  for (const [id, data] of Object.entries(imported.markdown))
    await writeFile(`${root}/${id}.md`, data);
  for (const [name, data] of Object.entries(imported.images))
    await writeFile(`${root}/images/${name}`, data);
  if (imported.readme) await writeFile(`${root}/README.md`, imported.readme);
  await writeFile(`${root}/catalog.json`, JSON.stringify(imported.catalog));
  console.log(
    JSON.stringify(
      {
        notes: imported.catalog.notes.length,
        images: imported.catalog.imageCount,
        uniqueImages: imported.catalog.imageFiles.length,
        repairs: imported.catalog.repairs,
        missingImages: imported.catalog.missingImages,
      },
      null,
      2,
    ),
  );
}
