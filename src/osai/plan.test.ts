import { test, expect } from "vitest";
import { vaultModules, osaiSeedMachines } from "./seeds";
import { loadOsaiArticle } from "./catalog";
test("vault study plan covers every section once and preserves legacy targets", async () => {
  const vault = await loadOsaiArticle("osai-vault");
  expect(vaultModules).toHaveLength(23);
  expect(vaultModules.map((m) => m.anchor)).toEqual(
    vault!.contents!.map((h) => h.id),
  );
  expect(new Set(vaultModules.map((m) => m.id)).size).toBe(23);
  expect(osaiSeedMachines).toHaveLength(30);
  expect(
    osaiSeedMachines.find((m) => m.id === "osai-module-foundations")?.content
      .name,
  ).toBe("AI foundations");
  for (const module of vaultModules)
    expect(
      osaiSeedMachines.find((m) => m.id === module.id)?.content.workspace,
    ).toBe("osai");
});
