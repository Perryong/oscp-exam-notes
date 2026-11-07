import { osaiCatalog } from "./catalog";
import type { Saved, MachineContent } from "../notebook/model";
export const osaiGroups = [
  ["foundations", "AI foundations"],
  ["prompt-output", "Prompt and output security"],
  ["retrieval", "Retrieval and RAG"],
  ["agents", "Agents and tool boundaries"],
  ["models-data", "Models and data"],
  ["infrastructure", "AI infrastructure"],
  ["assessment", "Assessment and reporting"],
] as const;
export const vaultPhases = [
  "Foundations",
  "Core attacks",
  "Advanced attacks",
  "Infrastructure",
  "Case studies",
  "Exam preparation",
];
export const vaultModules = osaiCatalog
  .find((a) => a.slug === "osai-vault")!
  .contents!.map((heading, index) => ({
    id: "osai-vault-m" + index,
    anchor: heading.id,
    title: heading.title,
    number: index,
    phase:
      vaultPhases[
        index <= 3
          ? 0
          : index <= 7
            ? 1
            : index <= 13
              ? 2
              : index <= 16
                ? 3
                : index <= 19
                  ? 4
                  : 5
      ],
  }));
export const osaiSeedMachines: Saved<MachineContent>[] = [
  ...osaiGroups.map(([slug, name]) => ["osai-module-" + slug, name]),
  ...vaultModules.map((m) => [m.id, m.title]),
].map(([id, name]) => ({
  id,
  content: {
    workspace: "osai",
    name,
    platform: "AI-300",
    os: "",
    tags: ["curriculum"],
    legacyKey: null,
    week: null,
    progress: "not-started",
  },
  revision: 0,
  lastMutationId: "seed",
  createdAt: 0,
  updatedAt: 0,
}));
export const isOsaiSeedId = (id: string): boolean =>
  osaiSeedMachines.some((m) => m.id === id);
