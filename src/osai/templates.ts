import type { JSONContent } from "@tiptap/core";
export function createOsaiLabTemplate(source?: {
  title: string;
  url: string;
}): JSONContent {
  const content: JSONContent[] = [
    "Objective and authorized scope",
    "Environment and model version",
    "Prerequisites",
    "Steps (numbered)",
    "Prompts and commands",
    "Expected versus observed results",
    "Screenshots and evidence",
    "Repeated trials: successes / total",
    "Impact and limitations",
    "Mitigations and retest",
    "References",
  ].flatMap((text) => [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] },
    { type: "paragraph" },
  ]);
  if (source)
    content.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: source.title,
          marks: [{ type: "link", attrs: { href: source.url } }],
        },
      ],
    });
  return { type: "doc", content };
}
