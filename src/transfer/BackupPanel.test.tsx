import "fake-indexeddb/auto";
import { test, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import BackupPanel from "./BackupPanel";
import { setMeta, getMeta } from "../persistence/local";
vi.mock("./backup", () => ({
  exportBackup: async () => ({
    blob: new Blob(["older file"]),
    report: { completed: [], failed: [], skipped: [] },
    acknowledgment: {
      draftRevisions: [{ id: "n", localRevision: 1, mutationId: "one" }],
    },
  }),
}));
vi.mock("./TransferPanel", () => ({ downloadBlob: () => {} }));
test("downloading an older tab acknowledges only that file, not newer shared metadata", async () => {
  render(<BackupPanel uid="alice" />);
  fireEvent.click(screen.getByText("Prepare full JSON backup"));
  const button = await screen.findByText("Download oscp-backup.json");
  await setMeta("alice", "prepared-export", {
    draftRevisions: [{ id: "n", localRevision: 2, mutationId: "two" }],
  });
  fireEvent.click(button);
  await waitFor(async () =>
    expect(
      (await getMeta<any>("alice", "last-export")).draftRevisions[0]
        .localRevision,
    ).toBe(1),
  );
  cleanup();
});
