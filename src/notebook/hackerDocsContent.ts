import lessons from "./hacker-docs.json";
import { encodeEditor } from "../editor/schema";

export const hackerLessons = lessons;
export type HackerLesson = (typeof lessons)[number];
export const hackerSnapshot = "c430f79ecfae0e9875935e61d979d0274cd1a1b5";
export const hackerSource = (lesson: HackerLesson) =>
  `https://github.com/ghostware0x00/Hacker-DOCS/blob/${hackerSnapshot}/${lesson.source.split("/").map(encodeURIComponent).join("/")}`;
export const hackerLessonPath = (id: string) =>
  `/knowledge-vault/hacker-docs--${id}`;

export function hackerLessonNote(lesson: HackerLesson) {
  const paragraph = (text: string) => ({
    type: "paragraph",
    content: [{ type: "text", text }],
  });
  const heading = (text: string) => ({
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text }],
  });
  const link = (text: string, href: string) => ({
    type: "paragraph",
    content: [
      { type: "text", text, marks: [{ type: "link", attrs: { href } }] },
    ],
  });
  return {
    title: lesson.title,
    tags: [
      "knowledge-vault",
      "hacker-docs",
      lesson.group.toLowerCase().replaceAll(" ", "-"),
    ],
    ...encodeEditor({
      type: "doc",
      content: [
        paragraph(
          "Original Fieldnotes study lesson · Topic reference: ghostware0x00/Hacker-DOCS · Reviewed 2026-10-17",
        ),
        paragraph(lesson.summary),
        paragraph(lesson.explanation),
        heading("Learning flow"),
        paragraph(lesson.flow.join(" → ")),
        heading("Study steps"),
        {
          type: "orderedList",
          content: lesson.steps.map((step) => ({
            type: "listItem",
            content: [paragraph(step)],
          })),
        },
        heading("Example / worksheet"),
        {
          type: "codeBlock",
          content: [{ type: "text", text: lesson.example }],
        },
        heading("Expected observations"),
        paragraph(lesson.observation),
        heading("Troubleshooting"),
        paragraph(lesson.troubleshooting),
        heading("Sources"),
        link("Hacker-DOCS source notes", hackerSource(lesson)),
        link("Primary reference", lesson.reference),
        heading("My lab observations"),
        paragraph(
          "Record your environment, evidence, interpretation and remaining questions here.",
        ),
      ],
    }),
  };
}
