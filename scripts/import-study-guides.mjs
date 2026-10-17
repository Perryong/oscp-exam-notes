import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { convertArticle } from "./import-walkthroughs.mjs";
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function buildStudyGuide(row, sourceHtml) {
  const doc = new JSDOM(sourceHtml).window.document;
  const root = doc.querySelector("article");
  if (!root) throw Error("Missing article: " + row.name);
  // Keep a short factual route map, not a reproduction of the source article.
  let words = 0;
  const stages = [...root.querySelectorAll("h2[id]")]
    .filter(
      (e) => !/box info|beyond root|video|references/i.test(e.textContent),
    )
    .filter((e) => {
      const n = e.textContent.trim().split(/\s+/).length;
      if (words + n > 20) return false;
      words += n;
      return true;
    })
    .slice(0, 5);
  const allImages = [...root.querySelectorAll("img[src]")]
    .map((e) => new URL(e.getAttribute("src"), row.url).href)
    .filter((u) => u.startsWith("https:"));
  const evidence = allImages.filter(
    (u) => !/(\/icons\/|cover|radar|diff\.|graph|ippsec|badge)/i.test(u),
  );
  const pictures = [
    ...new Set(
      evidence.length ? evidence : allImages.filter((u) => /cover/i.test(u)),
    ),
  ].slice(0, 3);
  if (!pictures.length) throw Error("No images: " + row.name);
  const sheet =
    "https://docs.google.com/spreadsheets/d/18weuz_Eeynr6sXFQ87Cd5F0slOj9Z6rt/edit";
  const refs = row.tracks
    .map(
      (track, i) =>
        `<a href="${sheet}?gid=${track === "OSCP" ? "487240997" : "317964736"}&amp;range=${escape(row.cells[i])}">${escape(track)} list · ${escape(row.cells[i])}</a>`,
    )
    .join(" · ");
  const route = stages
    .map((h, i) => {
      const title = h.textContent.trim();
      const guidance = /recon|enum/i.test(title)
        ? "Inventory the exposed services and compare the results with the reference. Record which observation justifies the next test."
        : /root|administrator|privesc/i.test(title)
          ? "Identify the privilege boundary and the permission, service or configuration that crosses it. Record the starting identity and verify the resulting access."
          : "Trace the prerequisite for this stage and how access changes. Keep the successful request, command output and account context together in your own notes.";
      return `<li><strong>${escape(title)}</strong><p>${guidance} <a href="${escape(row.url + "#" + encodeURIComponent(h.id))}">Detailed source step ${i + 1}</a></p></li>`;
    })
    .join("");
  const markdown = `# ${row.name}\n\nIllustrated study guide · Hack The Box · ${row.tracks.join(" / ")}\n\nThis original study outline accompanies 0xdf’s walkthrough. Selected source images are shown below; the complete commands and explanations remain in the credited original.\n\n## Study outline\n\n<ol>${route}</ol>\n\n## Visual references\n\n${pictures.map((url, i) => `<figure><img src="${escape(url)}" alt="${escape(row.name)} source visual ${i + 1}"><figcaption>Source visual ${i + 1} · 0xdf. See the original walkthrough for its full context.</figcaption></figure>`).join("\n\n")}\n\n## Record your result\n\nFor each stage, save the prerequisite, your observation, the evidence and the reason for the next action. Distinguish a failed hypothesis from a confirmed result. Recheck commands against the installed tool version.\n\n## Sources and scope\n\n<a href="${escape(row.url)}">Full walkthrough by 0xdf</a> · ${refs}\n\nList membership reflects LainKusanagi’s recommendations, not an official exam syllabus. Red Teaming includes topics beyond OSCP. Check the linked spreadsheet’s caveats, including AWS and out-of-scope privilege-escalation labels.\n\nSource links and article titles checked 17 October 2026. Lab steps have not been independently reproduced.\n`;
  const result = convertArticle(
    markdown,
    "hackthebox/" + row.name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".md",
    new Set(),
  );
  return {
    ...result,
    source: row.url,
    author: "0xdf",
    format: "Illustrated study guide",
    tracks: row.tracks,
    checkedAt: "2026-10-17",
    excerpt: `${row.tracks.join(" · ")}. Illustrated study outline with ${pictures.length} source visuals.`,
    searchText: stages.map((h) => h.textContent.trim()).join(" "),
  };
}
async function main() {
  const rows = JSON.parse(
    await readFile("scripts/study-guide-sources.json", "utf8"),
  );
  const results = [];
  let next = 0;
  await mkdir("/tmp/oscp-study-guide-cache", { recursive: true });
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < rows.length) {
        const row = rows[next++];
        const cache =
          "/tmp/oscp-study-guide-cache/" +
          row.name.replace(/[^a-z0-9]/gi, "") +
          ".html";
        let html;
        try {
          html = await readFile(cache, "utf8");
        } catch {
          const response = await fetch(row.url, {
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok) throw Error(row.url + " " + response.status);
          html = await response.text();
          await writeFile(cache, html);
        }
        const guide = buildStudyGuide(row, html);
        if (!guide.toc.length) throw Error("Empty guide");
        results.push(guide);
      }
    }),
  );
  results.sort((a, b) => a.title.localeCompare(b.title));
  for (const result of results)
    await writeFile(
      "public/walkthroughs/" + result.id + ".json",
      JSON.stringify({ html: result.html, toc: result.toc }, null, 2) + "\n",
    );
  await writeFile(
    "src/walkthroughs/study-guides.json",
    JSON.stringify(
      results.map(({ html, toc, ...entry }) => entry),
      null,
      2,
    ) + "\n",
  );
  console.log("Generated " + results.length + " illustrated study guides");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
