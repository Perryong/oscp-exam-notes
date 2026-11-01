import type { JSONContent } from "@tiptap/core";

export function createOsaiLabTemplate(source?: {
  title: string;
  url: string;
}): JSONContent {
  const sections = [
    [
      "Objectives and authorized scope",
      "Lab / module: [name]. Date: [date]. Authorized system and boundaries: [scope]. Hypothesis: [claim to test]. Success criterion: [measurable outcome].",
    ],
    [
      "Environment and model version",
      "Record application, model / provider and exact version, tools, retrieval sources, dataset version, permissions and relevant configuration. Include temperature, seed or other sampling settings when available.",
    ],
    [
      "Prerequisites",
      "Record required access, dependencies, test data and the baseline behavior. Use lab data and placeholders for secrets. Note any setup that another learner would need to reproduce the test.",
    ],
    [
      "Steps (numbered)",
      "For each Step ID, record the action, inputs, controlled variables and expected outcome. Change one factor at a time where possible; record deviations and failed attempts.",
    ],
    [
      "Prompts and commands",
      "Step ID: [S-01]. Purpose and input variables: [details]. Record the exact prompt / command, message roles and relevant conversation context. Capture output separately and reference its Evidence ID. Duplicate this block for additional steps.",
    ],
    [
      "Expected versus observed results",
      "Expected result: [baseline or prediction]. Observed result: [actual behavior]. Explain whether the success criterion was met, with evidence; distinguish model output from actions the application actually performed.",
    ],
    [
      "Screenshots and evidence",
      "Evidence ID: [E-01]. Related step / finding: [ID]. Capture time, model version and run ID: [details]. Add screenshots with Screenshot, relevant outputs and log excerpts; explain what each proves. Redact secrets before sharing.",
    ],
    [
      "Repeated trials: successes / total",
      "Record successes / total trials, the success criterion, run IDs and changed settings. Include failures, variability and a baseline comparison; do not infer reliability from one successful response.",
    ],
    [
      "Findings",
      "Finding ID: [F-01]. Affected component / trust boundary: [name]. Reproduction steps and Evidence IDs: [links]. State what was demonstrated and what remains a hypothesis.",
    ],
    [
      "Impact and limitations",
      "Describe the observed impact, required access, assumptions and limits of the lab. Record false positives and alternative explanations.",
    ],
    [
      "Mitigations and retest",
      "Proposed mitigation: [change]. Retest steps and matching baseline: [details]. Observed result and Evidence IDs: [links]. Record remaining gaps.",
    ],
    [
      "Lessons learned",
      "What changed your understanding? Which prompt or test design worked, and why? Record mistakes, unanswered questions and the next experiment to practise.",
    ],
    [
      "References",
      "Link the lesson, lab resources and other sources. Note which steps you reproduced and which were suggestions or hints.",
    ],
  ];
  const content: JSONContent[] = sections.flatMap(
    ([title, prompt]): JSONContent[] => [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }],
      },
      { type: "paragraph", content: [{ type: "text", text: prompt }] },
      ...(title === "Prompts and commands" ? [{ type: "codeBlock" }] : []),
      { type: "paragraph" },
    ],
  );
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
