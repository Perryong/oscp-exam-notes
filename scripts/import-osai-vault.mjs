import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function convertVault(source) {
  const document = new JSDOM(source).window.document;
  const main = document.querySelector("#main");
  if (!main || main.querySelectorAll(".module").length !== 23)
    throw Error("Expected all 23 vault modules");
  main.querySelector(".hero h1").textContent = "OSAI Vault";
  for (const module of main.querySelectorAll(".module")) {
    const heading = module.querySelector("h2");
    heading.id = "vault-" + module.id;
    heading.textContent = heading.textContent;
  }
  const html = sanitizeHtml(main.innerHTML, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      "*": ["id", "class"],
      a: ["href", "title"],
      img: ["src", "alt", "title"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
  });
  return {
    slug: "osai-vault",
    title: "OSAI Vault",
    group: "OSAI Vault",
    summary:
      "Full reference text · 23 modules · Imported from your supplied HTML without summarization.",
    attribution:
      "Source: Kongsec · User-supplied HTML · Imported 2026-10-15. Source claims are preserved as written, not independently verified.",
    checkedAt: "2026-10-15",
    owasp: [],
    contents: [...main.querySelectorAll(".module h2")].map((h) => ({
      id: h.id,
      title: h.textContent,
    })),
    sources: [
      {
        title: "Kongsec — original source",
        url: "https://kongsec.github.io/OSAINotesResearch/",
        kind: "community",
      },
    ],
    html,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const article = convertVault(
    readFileSync(new URL("./sources/osai-vault.html", import.meta.url), "utf8"),
  );
  writeFileSync(
    new URL("../src/osai/content/osai-vault.json", import.meta.url),
    JSON.stringify(article, null, 2) + "\n",
  );
  const path = new URL("../src/osai/catalog.json", import.meta.url);
  const catalog = JSON.parse(readFileSync(path, "utf8")).filter(
    (a) => a.slug !== article.slug,
  );
  const { html, ...metadata } = article;
  writeFileSync(path, JSON.stringify([metadata, ...catalog], null, 2) + "\n");
  console.log("Imported OSAI Vault: 23 modules");
}
