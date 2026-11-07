import type { JSONContent } from "@tiptap/core";

export function createMachineTemplate(): JSONContent {
  const sections = [
    [
      "Objectives and authorized scope",
      "Box / platform: [name]. Target / IP: [target]. Date: [date]. Authorized scope: [boundaries]. Learning objective and success criterion: [what you want to demonstrate].",
    ],
    [
      "Environment and prerequisites",
      "Record OS, network / VPN, tool versions, starting access and required files. Link the machine and study week in Details.",
    ],
    [
      "Enumeration",
      "Record services, versions and observations. For each lead, write the hypothesis, supporting evidence and next check. Include failed checks and what they ruled out.",
    ],
    [
      "Initial access",
      "Describe the verified route to access, prerequisites and numbered steps. Reference the command steps and evidence below; distinguish observations from assumptions.",
    ],
    [
      "Privilege escalation",
      "Record starting identity and privileges, the escalation hypothesis, steps, final identity and evidence. Note anything that did not reproduce.",
    ],
    [
      "Commands and results",
      "For each step: Step ID, purpose, prerequisites and target variables. Paste the exact command below. Expected result: [prediction]. Observed result: [output]. Decision / next step: [reason]. Duplicate this block for additional steps.",
    ],
    [
      "Evidence",
      "Evidence ID: [E-01]. Related step / finding: [ID]. Capture time and target: [details]. Add screenshots with Screenshot, paste relevant output, and explain what each item proves. Redact credentials before sharing.",
    ],
    [
      "Findings",
      "Finding ID: [F-01]. Affected component: [name]. Observation and reproduction steps: [steps]. Evidence IDs: [links]. Impact, prerequisites and limitations: [details]. Suggested remediation and retest result: [details].",
    ],
    [
      "Lessons learned",
      "What worked and why? Where did you get stuck? What would you change next time? Record one technique to practise again and any unresolved questions.",
    ],
    [
      "References and next steps",
      "Link the box resources, walkthroughs and sources you used. Separate hints from steps you reproduced. List the next study task and any lab cleanup required.",
    ],
  ];
  return {
    type: "doc",
    content: sections.flatMap(([title, prompt]): JSONContent[] => [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }],
      },
      { type: "paragraph", content: [{ type: "text", text: prompt }] },
      ...(title === "Commands and results" ? [{ type: "codeBlock" }] : []),
      { type: "paragraph" },
    ]),
  };
}
