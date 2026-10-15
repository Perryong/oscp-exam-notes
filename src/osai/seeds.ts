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
export const osaiSeedMachines: Saved<MachineContent>[] = osaiGroups.map(
  ([slug, name]) => ({
    id: "osai-module-" + slug,
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
  }),
);
export const isOsaiSeedId = (id: string): boolean =>
  osaiSeedMachines.some((m) => m.id === id);
