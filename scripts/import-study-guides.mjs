import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { selectConcepts, conceptDiagram } from "./study-guide-concepts.mjs";
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
  const tags = [...root.querySelectorAll(".post-tag")].map((e) =>
    e.textContent.trim(),
  );
  const selected = selectConcepts(tags, row.name);
  if (!selected.length) throw Error("No reviewed concepts: " + row.name);
  if (!stages.length) throw Error("No reading stages: " + row.name);
  const id = "hackthebox--" + row.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const diagramPath = "/walkthrough-diagrams/" + id + ".svg";
  const diagram = conceptDiagram(
    row.name,
    stages.map((h) => h.textContent.trim()),
  );
  const lessons = selected
    .map(
      (c, i) =>
        `### ${i + 1}. ${c.title}\n\n${c.explanation}\n\n**Expected observations:** ${c.observation}\n\n**Troubleshooting:** ${c.troubleshooting}\n\n**Apply it to ${row.name}:** In the reference, identify the evidence for this boundary. Mark each finding as observed, inferred or still unknown.\n`,
    )
    .join("\n");
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
  const markdown = `# ${row.name}

Conceptual walkthrough · Hack The Box · ${row.tracks.join(" / ")}

Study ${row.name} through ${selected.map((c) => c.title.toLowerCase()).join("; ")}. These original lessons explain the concepts associated with the source's topics. They are learning lenses, not a reproduced exploit procedure or a claim that every concept is part of the main solution.

## Learning map

![${row.name}: source reading stages](https://study-diagram.invalid${diagramPath})

**Text equivalent:** ${stages.map((h, i) => `${i + 1}. ${h.textContent.trim()}`).join(" → ")}

The arrows show source section order, not verified dependencies or a tested attack chain. For each transition, ask what changed: the identity, permission, execution environment or available evidence?

## Reading stages

<ol>${route}</ol>

## Concepts and observations

${lessons}

## Evidence checklist

| Record | What makes it useful |
| --- | --- |
| Starting context | Machine version, environment, account role and time of observation. |
| Observation | The visible behavior, artifact or permission, without assuming its cause. |
| Interpretation | The concept that explains the observation and the alternatives still possible. |
| Boundary | Which identity controls the resource, and which identity consumes it. |
| Confidence | Separate source-reported behavior from your own verified observations. |

## Troubleshooting workflow

1. Compare the environment with the reference: product version, account role and network context.
2. Find the earliest observation that differs. Later differences may be consequences of that first mismatch.
3. Separate connectivity, authentication, authorization and application behavior; each needs different evidence.
4. Use timestamps and logs to distinguish stale evidence from current behavior. Redact secrets before saving screenshots.
5. Record unresolved differences explicitly. A missing expected result is not a reason to assume success.

## Visual references

${pictures.map((url, i) => `<figure><img src="${escape(url)}" alt="${escape(row.name)} source visual ${i + 1}"><figcaption>Source visual ${i + 1} · 0xdf. Historical reference image; not evidence of a test performed by this app.</figcaption></figure>`).join("\n\n")}

When reading each image, identify the visible application or identity, the observation it supports and what it does not establish. Cover art, where used, identifies the machine and is not technical evidence.

## Sources and scope

<a href="${escape(row.url)}">Original machine reference by 0xdf</a> · ${refs}

List membership reflects community recommendations, not an official exam syllabus. Red Teaming includes topics beyond OSCP. Check the spreadsheet caveats. Machine section labels and images are credited to the source; explanations, troubleshooting and the learning map are original educational material. General concepts are selected from source metadata and reviewed topic mappings, not from an independent run of the lab.

Source links and titles checked 17 October 2026. These guides do not include exploitation commands or payloads. Lab behavior has not been independently reproduced.
`;
  const result = convertArticle(
    markdown,
    "hackthebox/" + row.name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".md",
    new Set(),
  );
  return {
    ...result,
    html: result.html.replaceAll(
      "https://study-diagram.invalid" + diagramPath,
      diagramPath,
    ),
    diagram,
    source: row.url,
    author: "0xdf",
    format: "Conceptual walkthrough",
    tracks: row.tracks,
    checkedAt: "2026-10-17",
    excerpt: `${row.tracks.join(" · ")}. ${selected.map((c) => c.title).join(" · ")}. Diagram, observations and troubleshooting.`,
    searchText: [
      ...stages.map((h) => h.textContent.trim()),
      ...selected.map((c) => c.title),
    ].join(" "),
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
  await mkdir("public/walkthrough-diagrams", { recursive: true });
  for (const result of results) {
    await writeFile(
      "public/walkthrough-diagrams/" + result.id + ".svg",
      result.diagram,
    );
    await writeFile(
      "public/walkthroughs/" + result.id + ".json",
      JSON.stringify({ html: result.html, toc: result.toc }, null, 2) + "\n",
    );
  }
  await writeFile(
    "src/walkthroughs/study-guides.json",
    JSON.stringify(
      results.map(({ html, toc, diagram, ...entry }) => entry),
      null,
      2,
    ) + "\n",
  );
  console.log("Generated " + results.length + " illustrated study guides");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
