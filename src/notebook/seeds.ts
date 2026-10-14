import ladder from "../reference/ladder.json";
import ids from "../reference/machine-ids.json";
import type { Saved, MachineContent } from "./model";
export const seedMachines: Saved<MachineContent>[] = Array.from(
  new Map(
    ladder.flatMap((w) =>
      w.boxes.map((b) => {
        const legacyKey = b.platform + "|" + b.name,
          id = (ids as Record<string, string>)[legacyKey];
        return [
          id,
          {
            id,
            content: {
              name: b.name,
              platform: b.platform,
              os: b.os,
              tags: [],
              legacyKey,
              week: w.week,
              progress: "not-started" as const,
            },
            revision: 0,
            lastMutationId: "seed",
            createdAt: 0,
            updatedAt: 0,
          },
        ] as [string, Saved<MachineContent>];
      }),
    ),
  ).values(),
);

export function withSeedMachines(machines: Saved<MachineContent>[]) {
  return [
    ...new Map([...seedMachines, ...machines].map((m) => [m.id, m])).values(),
  ];
}
