import type { NoteContent, MachineContent } from "./model";
import { decodeEditor } from "../editor/schema";
export const bytes = (s: string) => new TextEncoder().encode(s).byteLength;
export function validId(s: unknown): s is string {
  return typeof s === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(s);
}
function str(s: unknown, max: number) {
  return typeof s === "string" && bytes(s) <= max;
}
function tags(s: unknown) {
  return (
    Array.isArray(s) &&
    s.length <= 30 &&
    new Set(s).size === s.length &&
    s.every((t) => str(t, 40))
  );
}
function week(n: unknown) {
  return (
    n === null || (Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 500)
  );
}
function fields(x: unknown, keys: string[]): Record<string, unknown> {
  if (
    !x ||
    typeof x !== "object" ||
    Array.isArray(x) ||
    Object.keys(x).some((k) => ![...keys, "workspace"].includes(k)) ||
    keys.some((k) => !Object.hasOwn(x, k))
  )
    throw Error("Invalid fields");
  if (
    Object.hasOwn(x, "workspace") &&
    !["oscp", "osai"].includes(
      (x as Record<string, unknown>).workspace as string,
    )
  )
    throw Error("Invalid workspace");
  return x as Record<string, unknown>;
}
export function validateNote(input: unknown): NoteContent {
  const x = fields(input, [
    "title",
    "contentJson",
    "text",
    "tags",
    "machineId",
    "week",
    "attachmentIds",
    "schemaVersion",
    "deletedAt",
    "sourceHtml",
  ]);
  if (
    !str(x.title, 200) ||
    typeof x.contentJson !== "string" ||
    typeof x.text !== "string" ||
    !(x.sourceHtml === null || typeof x.sourceHtml === "string") ||
    bytes(x.contentJson + x.text + (x.sourceHtml || "")) > 614400 ||
    !tags(x.tags) ||
    !(x.machineId === null || validId(x.machineId)) ||
    !week(x.week) ||
    !Array.isArray(x.attachmentIds) ||
    x.attachmentIds.length > 100 ||
    new Set(x.attachmentIds).size !== x.attachmentIds.length ||
    !x.attachmentIds.every(validId) ||
    x.schemaVersion !== 1 ||
    !(
      x.deletedAt === null ||
      (Number.isSafeInteger(x.deletedAt) && Number(x.deletedAt) >= 0)
    )
  )
    throw Error("Invalid or oversized note");
  decodeEditor(x.contentJson);
  return x as unknown as NoteContent;
}
export function validateMachine(input: unknown): MachineContent {
  const x = fields(input, [
    "name",
    "platform",
    "os",
    "tags",
    "legacyKey",
    "week",
    "progress",
  ]);
  if (
    !str(x.name, 200) ||
    !str(x.platform, 80) ||
    !str(x.os, 80) ||
    !tags(x.tags) ||
    !(x.legacyKey === null || str(x.legacyKey, 400)) ||
    !week(x.week) ||
    !["not-started", "in-progress", "completed"].includes(String(x.progress))
  )
    throw Error("Invalid machine");
  return x as unknown as MachineContent;
}
