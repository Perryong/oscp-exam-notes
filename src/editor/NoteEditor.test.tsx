import "fake-indexeddb/auto";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import NoteEditor, { beforeLeaveEditor } from "./NoteEditor";
import { draft, noteContent } from "../../tests/fixtures/builders";
import { saveDraft, listConflicts } from "../persistence/local";
const state = vi.hoisted(() => ({
  update: null as any,
  doc: {} as any,
  editable: true,
}));
vi.mock("react-router-dom", () => ({
  useBlocker: () => ({ state: "unblocked" }),
}));
vi.mock("@tiptap/react", () => ({
  useEditor: (options: any) => {
    state.update = options.onUpdate;
    return {
      setEditable: (value: boolean) => (state.editable = value),
      getJSON: () => state.doc,
      getText: () => "UNSAVED TEXT",
    };
  },
  EditorContent: () => <div />,
  ReactNodeViewRenderer: () => () => null,
}));
afterEach(cleanup);
test("encoding failure protects navigation and exports the live document", async () => {
  const value = draft({ id: "encoding" });
  render(<NoteEditor uid="alice" draft={value} />);
  state.doc = {
    type: "doc",
    content: [
      {
        type: "unsupported",
        content: [{ type: "text", text: "UNSAVED TEXT" }],
      },
    ],
  };
  await act(async () =>
    state.update({
      editor: { getJSON: () => state.doc, getText: () => "UNSAVED TEXT" },
    }),
  );
  expect(await beforeLeaveEditor()).toBe(false);
  const blobs: Blob[] = [];
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: (b: Blob) => {
        blobs.push(b);
        return "blob:test";
      },
      revokeObjectURL: () => {},
    }),
  );
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  fireEvent.click(screen.getByText("Export current draft"));
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blobs[0]);
  });
  expect(JSON.parse(text).contentJson).toContain("UNSAVED TEXT");
  state.doc = JSON.parse(noteContent().contentJson);
  await act(async () =>
    state.update({ editor: { getJSON: () => state.doc, getText: () => "" } }),
  );
  await waitFor(async () => expect(await beforeLeaveEditor()).toBe(true));
  click.mockRestore();
});
test("a durable stale-tab recovery is safe to leave and cannot blindly retry", async () => {
  const stale = draft({ id: "stale" });
  await saveDraft(stale, 0);
  render(<NoteEditor uid="alice" draft={stale} />);
  fireEvent.change(screen.getByLabelText("Note title"), {
    target: { value: "Recovered edit" },
  });
  await waitFor(async () =>
    expect(await listConflicts("alice")).toHaveLength(1),
  );
  await waitFor(async () => expect(await beforeLeaveEditor()).toBe(true));
  expect(screen.queryByText("Retry local save")).toBeNull();
  expect(screen.getByText("Reload latest saved note")).toBeTruthy();
  expect(
    (screen.getByLabelText("Note title") as HTMLInputElement).disabled,
  ).toBe(true);
});
