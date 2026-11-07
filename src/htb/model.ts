import snapshot from "./schedule.json";
import type { MachineContent } from "../notebook/model";

export type HtbModule = Readonly<(typeof snapshot.remaining_modules)[number]>;
export type StudyWeek = Readonly<
  Omit<(typeof snapshot.weeks)[number], "allocations"> & {
    allocations: readonly Readonly<{ module: number; hours: number }>[];
  }
>;
export type HtbSchedule = Readonly<
  Omit<typeof snapshot, "remaining_modules" | "weeks"> & {
    remaining_modules: readonly HtbModule[];
    weeks: readonly StudyWeek[];
  }
>;
export type HtbSession = {
  date: string;
  hours: number;
  moduleId: number | null;
  title: string;
  kind: "module" | "practice" | "review";
  week: number;
};

export const schedule: HtbSchedule = snapshot;
export const modules = schedule.remaining_modules;
export const studyWeeks = schedule.weeks;

function moduleForId(id: number): HtbModule {
  const module = modules.find((candidate) => candidate.id === id);
  if (!module) throw new RangeError(`Unknown HTB module: ${id}`);
  return module;
}

export function htbModuleId(id: number): string {
  moduleForId(id);
  return `htb-module-${id}`;
}

export function htbModuleMachine(id: number): MachineContent {
  return {
    workspace: "oscp",
    name: moduleForId(id).title,
    platform: "HTB Academy",
    os: "General",
    tags: ["htb-academy"],
    legacyKey: null,
    week: null,
    progress: "not-started",
  };
}

export function sessionsForWeek(week: number): HtbSession[] {
  if (!Number.isInteger(week) || week < 1 || week > studyWeeks.length)
    throw new RangeError(`HTB week must be between 1 and ${studyWeeks.length}`);
  const planned = studyWeeks[week - 1];
  const blocks = [
    ...planned.allocations.map((allocation) => ({
      hours: allocation.hours,
      moduleId: allocation.module,
      title: moduleForId(allocation.module).title,
      kind: "module" as const,
    })),
    ...(planned.practice_hours
      ? [
          {
            hours: planned.practice_hours,
            moduleId: null,
            title:
              planned.kind === "Checkpoint and catch-up"
                ? "Checkpoint and catch-up"
                : "Independent capstone replay",
            kind: "practice" as const,
          },
        ]
      : []),
  ];
  const sessions: HtbSession[] = [];
  let blockIndex = 0;
  for (const offset of [0, 2, 3, 5]) {
    const date = new Date(`${planned.start}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    let available = 2;
    while (available > 0 && blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      const hours = Math.min(available, block.hours);
      sessions.push({
        ...block,
        hours,
        week,
        date: date.toISOString().slice(0, 10),
      });
      block.hours -= hours;
      available -= hours;
      if (block.hours === 0) blockIndex++;
    }
  }
  sessions.push({
    week,
    date: planned.end,
    hours: planned.review_hours,
    moduleId: null,
    title: "Weekly review",
    kind: "review",
  });
  return sessions;
}
