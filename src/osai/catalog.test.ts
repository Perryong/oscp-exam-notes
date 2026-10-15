import { test, expect } from "vitest";
import { osaiCatalog, loadOsaiArticle } from "./catalog";
test("curated library has stable complete lessons, attribution and inert markup", async () => {
  expect(osaiCatalog).toHaveLength(11);
  expect(new Set(osaiCatalog.map((a) => a.slug)).size).toBe(11);
  for (const entry of osaiCatalog) {
    const a = await loadOsaiArticle(entry.slug);
    expect(a).not.toBeNull();
    expect(a!.sources.length).toBeGreaterThan(0);
    expect(a!.sources.every((s) => s.url.startsWith("https://"))).toBe(true);
    expect(a!.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a!.html).not.toMatch(/<script|\son\w+=|javascript:/i);
    if (entry.group !== "Resources")
      for (const title of [
        "Objectives",
        "Practice",
        "Expected observations",
        "Mitigations",
      ])
        expect(a!.html).toContain(title);
  }
  expect(await loadOsaiArticle("missing")).toBeNull();
});
