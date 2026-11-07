import { expect, test } from "vitest";
import {
  htbModuleId,
  htbModuleMachine,
  modules,
  schedule,
  sessionsForWeek,
  studyWeeks,
} from "./model";
import { weeklyNoteInitial } from "./templates";
import { decodeEditor } from "../editor/schema";

test("schedule preserves all 348 module hours across 51 dated weeks", () => {
  expect(modules).toHaveLength(27);
  expect(studyWeeks).toHaveLength(51);
  expect(modules.reduce((sum, module) => sum + module.planned_hours, 0)).toBe(
    348,
  );
  expect(studyWeeks[0].start).toBe("2026-11-09");
  expect(studyWeeks[50].end).toBe("2027-10-31");
  const hoursByModule = new Map<number, number>();
  for (const week of studyWeeks) {
    const sessions = sessionsForWeek(week.week);
    expect(sessions.reduce((sum, session) => sum + session.hours, 0)).toBe(10);
    expect(sessions.filter((session) => session.kind === "review")).toEqual([
      {
        week: week.week,
        date: week.end,
        hours: 2,
        moduleId: null,
        title: "Weekly review",
        kind: "review",
      },
    ]);
    for (const session of sessions) {
      if (session.moduleId !== null)
        hoursByModule.set(
          session.moduleId,
          (hoursByModule.get(session.moduleId) ?? 0) + session.hours,
        );
    }
  }
  for (const module of modules)
    expect(hoursByModule.get(module.id)).toBe(module.planned_hours);
});

test("allocations split within the four course sessions without shifting source dates", () => {
  const original = JSON.stringify(schedule);
  expect(
    sessionsForWeek(2).map(({ date, hours, moduleId }) => ({
      date,
      hours,
      moduleId,
    })),
  ).toEqual([
    { date: "2026-11-16", hours: 2, moduleId: 19 },
    { date: "2026-11-18", hours: 2, moduleId: 19 },
    { date: "2026-11-19", hours: 2, moduleId: 19 },
    { date: "2026-11-21", hours: 1, moduleId: 19 },
    { date: "2026-11-21", hours: 1, moduleId: 112 },
    { date: "2026-11-22", hours: 2, moduleId: null },
  ]);
  expect(sessionsForWeek(7).map((session) => session.kind)).toEqual([
    "practice",
    "practice",
    "practice",
    "practice",
    "review",
  ]);
  expect(
    sessionsForWeek(51)
      .filter((session) => session.kind === "practice")
      .reduce((sum, session) => sum + session.hours, 0),
  ).toBe(4);
  sessionsForWeek(1)[0].date = "2099-01-01";
  expect(JSON.stringify(schedule)).toBe(original);
});

test.each([0, -1, 52, 1.5, NaN, Infinity])(
  "invalid week %s is rejected",
  (week) => {
    expect(() => sessionsForWeek(week)).toThrow(RangeError);
    expect(() => weeklyNoteInitial(week)).toThrow(RangeError);
  },
);

test("a scheduled module has one stable machine identity across weeks", () => {
  expect(htbModuleId(112)).toBe("htb-module-112");
  expect(htbModuleMachine(112)).toEqual({
    workspace: "oscp",
    name: "Footprinting",
    platform: "HTB Academy",
    os: "General",
    tags: ["htb-academy"],
    legacyKey: null,
    week: null,
    progress: "not-started",
  });
  expect(() => htbModuleMachine(999)).toThrow(RangeError);
  expect(() => htbModuleId(999)).toThrow(RangeError);
});

test("weekly notes use a separate legacy week and editable learning assessment", () => {
  const note = weeklyNoteInitial(2);
  expect(note).toMatchObject({
    title: "HTB week 2 notes",
    workspace: "oscp",
    week: 202,
    machineId: null,
    tags: ["htb-academy", "htb-week-2"],
    schemaVersion: 1,
    attachmentIds: [],
    sourceHtml: null,
    deletedAt: null,
  });
  expect(() => decodeEditor(note.contentJson)).not.toThrow();
  for (const text of [
    "Goals",
    "Attempts",
    "What I learned",
    "Where I got stuck",
    "Progress",
    "Learning Process",
    "Penetration Testing Process",
    "Pre-engagement",
    "Information gathering",
    "Vulnerability assessment",
    "Exploitation",
    "Post-exploitation",
    "Lateral movement",
    "Proof of concept",
    "Post-engagement",
    "hints",
    "independent",
  ])
    expect(note.text).toContain(text);
  expect(note.text).toContain("Network Enumeration with Nmap");
  expect(note.text).toContain("Footprinting");
  note.tags.push("changed");
  expect(weeklyNoteInitial(2).tags).toEqual(["htb-academy", "htb-week-2"]);
});
