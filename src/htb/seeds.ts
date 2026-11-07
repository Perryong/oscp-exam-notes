import type { MachineContent, Saved } from "../notebook/model";
import { htbModuleId, htbModuleMachine, modules } from "./model";

export const htbSeedMachines: Saved<MachineContent>[] = modules.map(
  (module) => ({
    id: htbModuleId(module.id),
    content: htbModuleMachine(module.id),
    revision: 0,
    lastMutationId: "seed",
    createdAt: 0,
    updatedAt: 0,
  }),
);

export const isHtbModule = (id: string) =>
  htbSeedMachines.some((machine) => machine.id === id);
