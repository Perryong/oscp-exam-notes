import { readFile, writeFile } from "node:fs/promises";
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const [
  topics,
  originals,
  guides,
  hacker,
  lessons,
  cheat,
  previous,
  ladder,
  machineIds,
] = await Promise.all(
  [
    "src/oscp/topics.json",
    "src/walkthroughs/catalog.json",
    "src/walkthroughs/study-guides.json",
    "public/hacker-docs/catalog.json",
    "src/notebook/hacker-docs.json",
    "src/reference/imported-cheatsheet.json",
    "src/reference/cheatsheet.json",
    "src/reference/ladder.json",
    "src/reference/machine-ids.json",
  ].map(read),
);
const resources = [];
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
function add(id, title, kind, href, collection, metadata = "") {
  const words = " " + normalize(title + " " + metadata) + " ";
  const topicIds = topics
    .filter((t) =>
      t.keywords.some((k) => words.includes(" " + normalize(k) + " ")),
    )
    .map((t) => t.id);
  resources.push({ id, title, kind, href, collection, topicIds });
}
for (const a of [...originals.articles, ...guides])
  add(
    "walkthrough:" + a.id,
    a.title,
    "walkthrough",
    "/walkthroughs/" + a.id,
    "Walkthroughs",
    a.path + " " + a.searchText + " " + a.excerpt,
  );
for (const n of hacker.notes)
  add(
    "source:" + n.id,
    n.title,
    "reference",
    "/knowledge-vault/hacker-docs--source-" + n.id,
    "Hacker-DOCS full notes",
    n.path + " " + n.group,
  );
for (const l of lessons)
  add(
    "lesson:" + l.id,
    l.title,
    "lesson",
    "/knowledge-vault/hacker-docs--" + l.id,
    "Introductory lessons",
    l.group + " " + l.summary,
  );
for (const [collection, sections] of [
  ["imported", cheat.sections],
  ["previous", previous],
])
  for (const s of sections)
    add(
      "cheat:" + collection + ":" + s.id,
      s.title,
      "cheatsheet",
      "/cheat-sheet?collection=" +
        collection +
        "&section=" +
        encodeURIComponent(s.id),
      collection === "imported" ? "OSCP cheat sheet" : "Previous cheat sheet",
      s.group || "",
    );
const machines = new Map();
for (const w of ladder) {
  add(
    "week:" + w.week,
    "Week " + w.week + " · " + w.boxes.map((b) => b.name).join(", "),
    "week",
    "/study-plan?week=" + w.week,
    "Weekly practice",
  );
  resources.at(-1).links = w.boxes.map(
    (b) => "machine:" + machineIds[b.platform + "|" + b.name],
  );
  for (const b of w.boxes)
    machines.set(machineIds[b.platform + "|" + b.name], b);
}
for (const [id, m] of machines) {
  add(
    "machine:" + id,
    m.name,
    "machine",
    "/machines#" + id,
    "Practice machines",
    m.os,
  );
  const category = {
    HackTheBox: "hackthebox",
    TryHackMe: "thm",
    VulnHub: "vulnhub",
  }[m.platform];
  resources.at(-1).links = [...originals.articles, ...guides]
    .filter(
      (a) =>
        category &&
        a.category === category &&
        normalize(a.title) === normalize(m.name),
    )
    .map((a) => "walkthrough:" + a.id);
}
if (new Set(resources.map((r) => r.id)).size !== resources.length)
  throw Error("Duplicate OSCP resource IDs");
await writeFile(
  "src/oscp/resources.json",
  JSON.stringify(resources, null, 2) + "\n",
);
console.log(
  "Indexed " +
    resources.length +
    " OSCP resources across " +
    new Set(resources.map((r) => r.collection)).size +
    " collections",
);
