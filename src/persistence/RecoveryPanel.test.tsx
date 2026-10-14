import "fake-indexeddb/auto";
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecoveryPanel from "./RecoveryPanel";
import { saveDraft, getDraft, listConflicts } from "./local";
import { draft, noteContent } from "../../tests/fixtures/builders";
vi.mock("../firebase/notes", () => ({
  listHistory: async () => [
    {
      id: "note1",
      content: noteContent({ title: "History" }),
      revision: 1,
      updatedAt: 1,
    },
  ],
  readEntity: async () => ({ revision: 2 }),
}));
vi.mock("../editor/NoteEditor", () => ({
  beforeLeaveEditor: async () => true,
}));
test("restoration archives the outstanding draft before replacing it", async () => {
  await saveDraft(
    draft({ content: noteContent({ title: "UNSYNCED CURRENT" }) }),
    0,
  );
  const restored = vi.fn();
  render(<RecoveryPanel uid="alice" id="note1" onRestored={restored} />);
  fireEvent.click(await screen.findByText("Restore revision 1"));
  await waitFor(() => expect(restored).toHaveBeenCalled());
  expect((await getDraft("alice", "note", "note1"))?.content).toMatchObject({
    title: "History",
  });
  expect((await listConflicts("alice")).map((d) => d.content)).toContainEqual(
    expect.objectContaining({ title: "UNSYNCED CURRENT" }),
  );
});
