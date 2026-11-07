import { useRef, useState } from "react";
import { readLegacyBrowser, planMigration } from "./legacy";
import { readLegacyCloud, applyMigration } from "../firebase/migration";
import type { MigrationItem, TransferReport } from "../notebook/model";
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function TransferPanel({ uid }: { uid: string }) {
  const [items, setItems] = useState<MigrationItem[]>([]),
    [report, setReport] = useState<TransferReport | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selectRetained, setSelectRetained] = useState(false),
    [fileSources, setFileSources] = useState<ReturnType<
      typeof readLegacyBrowser
    > | null>(null),
    cancel = useRef(false);
  async function preview() {
    setBusy(true);
    setError("");
    try {
      const owner = localStorage.getItem("oscp-notebook-legacy-owner");
      if (!fileSources && owner && owner !== uid && !selectRetained)
        throw Error(
          "These browser sources were imported by a different account. Explicitly select them below to import a separate copy.",
        );
      setItems(
        await planMigration(
          uid,
          fileSources || readLegacyBrowser(localStorage),
          await readLegacyCloud(uid),
        ),
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    setBusy(true);
    cancel.current = false;
    try {
      const result = await applyMigration(uid, items, () => cancel.current);
      setReport(result);
      if (result.completed.length && !fileSources)
        localStorage.setItem("oscp-notebook-legacy-owner", uid);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Import your previous notebook</h2>
      <p>
        Destination account: {uid}. Originals stay intact. Cloud and browser
        versions are preserved separately.
      </p>
      <label>
        <input
          type="checkbox"
          checked={selectRetained}
          onChange={(e) => setSelectRetained(e.target.checked)}
        />
        Explicitly select retained browser sources, including sources claimed by
        another account
      </label>
      <label>
        Legacy export file
        <input
          type="file"
          accept="application/json"
          onChange={async (e) => {
            try {
              const f = e.target.files?.[0];
              if (!f) return;
              const data = JSON.parse(await f.text());
              if (
                data.version !== 1 ||
                !data.legacySources ||
                typeof data.legacySources !== "object"
              )
                throw Error("Invalid legacy export");
              const notes: Record<string, string> = {};
              for (const [k, v] of Object.entries(data.legacySources)) {
                const m = /^(?:browser:|oscp-note-)(\d+)$/.exec(k);
                if (m && typeof v === "string") notes[m[1]] = v;
              }
              setFileSources({ notes, progress: data.unmatchedProgress || {} });
            } catch (e) {
              setError(String(e));
            }
          }}
        />
      </label>
      <button disabled={busy} onClick={() => void preview()}>
        Preview legacy import
      </button>
      <button
        onClick={() =>
          downloadBlob(
            new Blob(
              [
                JSON.stringify({
                  version: 1,
                  legacySources: Object.fromEntries(
                    Object.entries(readLegacyBrowser(localStorage).notes).map(
                      ([k, v]) => ["browser:" + k, v],
                    ),
                  ),
                  unmatchedProgress: readLegacyBrowser(localStorage).progress,
                }),
              ],
              { type: "application/json" },
            ),
            "legacy-browser-sources.json",
          )
        }
      >
        Export original browser sources
      </button>
      {items.length > 0 && (
        <>
          <p>{items.length} items ready for review</p>
          <ul>
            {items.map((i) => (
              <li key={i.id}>
                {i.source}:{" "}
                {"title" in i.payload ? i.payload.title : i.payload.name}
              </li>
            ))}
          </ul>
          <button disabled={busy} onClick={() => void apply()}>
            Import reviewed items
          </button>
        </>
      )}
      {busy && (
        <button
          onClick={() => {
            cancel.current = true;
          }}
        >
          Cancel after current item
        </button>
      )}
      {report && (
        <p role="status">
          {report.completed.length} imported · {report.skipped.length} skipped ·{" "}
          {report.failed.length} failed
          {report.failed.map((f) => (
            <span className="block" key={f.id}>
              {f.reason}
            </span>
          ))}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
