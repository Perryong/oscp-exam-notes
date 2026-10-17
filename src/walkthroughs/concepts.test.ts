import { test, expect } from "vitest";
import { buildStudyGuide } from "../../scripts/import-study-guides.mjs";
const row = {
  name: "Forest",
  url: "https://example.com/forest",
  tracks: ["OSCP"],
  cells: ["C13"],
};
test("conceptual guide teaches source-specific topics and preserves safe imagery", () => {
  const guide = buildStudyGuide(
    row,
    '<article><a class="post-tag">as-rep-roast</a><a class="post-tag">dcsync</a><h2 id="recon">Recon</h2><h2 id="user">User identity</h2><img src="https://example.com/shot.png"><p>Source prose must not be copied.</p></article>',
  );
  expect(guide.html).toContain("Concepts and observations");
  expect(guide.html).toContain("Kerberos");
  expect(guide.html).toContain("replication");
  expect(guide.html).toContain("Troubleshooting");
  expect(guide.html).toContain("/walkthrough-diagrams/hackthebox--forest.svg");
  expect(guide.diagram).toContain("<svg");
  expect(guide.diagram).toContain('width="720"');
  expect(guide.html).not.toContain("Source prose must not be copied");
  expect(guide.html).not.toContain("<pre");
});
test("unmapped sources fail rather than silently producing another generic outline", () => {
  expect(() =>
    buildStudyGuide(
      row,
      '<article><h2 id="x">Unknown</h2><img src="https://example.com/x.png"></article>',
    ),
  ).toThrow(/concept/i);
});

test("all 119 published guides include expanded sections, diagrams and credited images", async () => {
  const fs = await import("node:fs/promises");
  const entries = JSON.parse(
    await fs.readFile("src/walkthroughs/study-guides.json", "utf8"),
  );
  expect(entries).toHaveLength(119);
  expect(new Set(entries.map((e: any) => e.id)).size).toBe(119);
  for (const e of entries) {
    const body = JSON.parse(
      await fs.readFile(`public/walkthroughs/${e.id}.json`, "utf8"),
    );
    for (const section of [
      "Learning map",
      "Reading stages",
      "Concepts and observations",
      "Evidence checklist",
      "Troubleshooting workflow",
      "Visual references",
      "Sources and scope",
    ])
      expect(
        body.toc.some((h: any) => h.title === section),
        `${e.id}: ${section}`,
      ).toBe(true);
    expect(body.html).toContain("Expected observations:");
    expect(body.html).toContain("Troubleshooting:");
    expect(body.html).toContain(`/walkthrough-diagrams/${e.id}.svg`);
    expect(body.html).toContain("Historical reference image");
    expect(body.html).not.toContain("study-diagram.invalid");
    expect(body.html).not.toContain("<pre");
    expect(
      await fs.readFile(`public/walkthrough-diagrams/${e.id}.svg`, "utf8"),
    ).toContain("<svg");
  }
});
test("topic matching does not mistake Kerberos or brace expansion for templates or races", async () => {
  const { selectConcepts, conceptDiagram } =
    await import("../../scripts/study-guide-concepts.mjs");
  expect(
    selectConcepts(["kerberos", "bash-brace-expansion"]).map((c: any) => c.id),
  ).not.toContain("template");
  expect(
    selectConcepts(["bash-brace-expansion"]).map((c: any) => c.id),
  ).not.toContain("race");
  expect(conceptDiagram("<script>", ["A & B"])).not.toContain("<script>");
  expect(conceptDiagram("<script>", ["A & B"])).toContain("A &amp; B");
});
