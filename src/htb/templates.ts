import type { JSONContent } from "@tiptap/core";
import { encodeEditor } from "../editor/schema";
import { emptyNote, type NoteContent } from "../notebook/model";
import { sessionsForWeek, studyWeeks } from "./model";

export function weeklyNoteInitial(week: number): NoteContent {
  const sessions = sessionsForWeek(week);
  const planned = studyWeeks[week - 1];
  const sections = [
    [
      "Goals",
      `Week ${week}: ${planned.start} to ${planned.end}. Plan measurable outcomes for ${[...new Set(sessions.filter((session) => session.kind !== "review").map((session) => session.title))].join("; ")}. Use Learning Process (module 9): set a goal, explain the concept in your own words, test it, then reflect.`,
    ],
    [
      "Attempts",
      "Record the lab, hypothesis, exact commands, expected and observed results, evidence, failed attempts and hints used. Retry the technique independently from a fresh start.",
    ],
    [
      "What I learned",
      "Explain what worked and why without copying a walkthrough. Apply Learning Process (module 9): identify knowledge gaps, connect the concept to earlier learning and choose a focused practice task.",
    ],
    [
      "Where I got stuck",
      "What precise blocker stopped progress? Which assumptions did you test? Record hints used, what they changed, and an independent retry plan.",
    ],
    [
      "Progress",
      "Record planned versus actual hours, completed sections and assessments, independent retries, unresolved questions and next week's actions. Mark a module complete only after finishing the whole module, including its labs and assessment.",
    ],
    [
      "Assessment stages — Penetration Testing Process (module 90)",
      "Pre-engagement: confirm authorized scope, objectives and rules of engagement. Information gathering: record enumeration evidence and attack surface. Vulnerability assessment: form and validate hypotheses. Exploitation: document prerequisites, attempts and verified access. Post-exploitation: record identity, privileges and impact. Lateral movement: document authorized paths and dependencies. Proof of concept: reproduce the result with evidence. Post-engagement: report findings, remediation, cleanup and retest results. For each stage, distinguish what you performed from what remains untested.",
    ],
  ];
  const doc: JSONContent = {
    type: "doc",
    content: sections.flatMap(([title, prompt]): JSONContent[] => [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }],
      },
      { type: "paragraph", content: [{ type: "text", text: prompt }] },
      ...(title === "Attempts" ? [{ type: "codeBlock" }] : []),
      { type: "paragraph" },
    ]),
  };
  return {
    ...emptyNote("oscp"),
    ...encodeEditor(doc),
    title: `HTB week ${week} notes`,
    week: 200 + week,
    tags: ["htb-academy", `htb-week-${week}`],
  };
}
