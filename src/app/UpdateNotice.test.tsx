import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

const sw = vi.hoisted(() => ({ refresh: () => {} }));
vi.mock("virtual:pwa-register", () => ({
  registerSW: (options: { onNeedRefresh: () => void }) => {
    sw.refresh = options.onNeedRefresh;
    return vi.fn();
  },
}));
vi.mock("../editor/NoteEditor", () => ({
  beforeLeaveEditor: async () => true,
}));
import { registerOfflineShell } from "../pwa";
import UpdateNotice from "./UpdateNotice";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
test("a waiting update remains visible when account loading remounts the notice", () => {
  vi.stubEnv("PROD", true);
  registerOfflineShell();
  const first = render(<UpdateNotice />);
  act(() => sw.refresh());
  expect(
    screen.getByRole("button", { name: "Update after saving" }),
  ).toBeTruthy();
  first.unmount();
  render(<UpdateNotice />);
  expect(
    screen.getByRole("button", { name: "Update after saving" }),
  ).toBeTruthy();
});
