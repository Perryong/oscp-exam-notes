import { useRef, useState } from "react";
import { exportBackup, importBackup } from "./backup";
import { exportMarkdown } from "./markdown";
import { downloadBlob } from "./TransferPanel";
import { setMeta } from "../persistence/local";
import type { TransferReport } from "../notebook/model";
export default function BackupPanel({ uid }: { uid: string }) {
  const [prepared, setPrepared] = useState<{
      blob: Blob;
      report: TransferReport;
      name: string;
      acknowledgment?: Awaited<
        ReturnType<typeof exportBackup>
      >["acknowledgment"];
    } | null>(null),
    [report, setReport] = useState<TransferReport | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    cancel = useRef(false);
  async function prepare(markdown: boolean) {
    setBusy(true);
    setPrepared(null);
    try {
      const result = await (markdown ? exportMarkdown(uid) : exportBackup(uid));
      setPrepared({
        ...result,
        name: markdown ? "fieldnotes.zip" : "fieldnotes-backup-v2.json",
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="quiet">
        Account-wide: backups include both OSCP and OSAI workspaces.
      </p>
      <h2>Backups & exports</h2>
      <p>
        JSON includes current notes, trash, retained history, screenshots and
        original source records. Markdown is a readable ZIP.
      </p>
      <button disabled={busy} onClick={() => void prepare(false)}>
        Prepare full JSON backup
      </button>
      <button disabled={busy} onClick={() => void prepare(true)}>
        Prepare Markdown ZIP
      </button>
      {prepared && (
        <div role="status">
          <p>
            {prepared.report.failed.length
              ? "Incomplete export — missing items are listed below."
              : "Export prepared with no reported missing items."}
          </p>
          {prepared.report.failed.map((f) => (
            <p key={f.id}>
              {f.id}: {f.reason}
            </p>
          ))}
          <button
            onClick={() => {
              downloadBlob(
                prepared.blob,
                (prepared.report.failed.length ? "PARTIAL-" : "") +
                  prepared.name,
              );
              if (
                !prepared.report.failed.length &&
                prepared.name.endsWith(".json")
              )
                void setMeta(uid, "last-export", prepared.acknowledgment).catch(
                  (e) => setError(String(e)),
                );
            }}
          >
            Download {prepared.report.failed.length ? "partial " : ""}
            {prepared.name}
          </button>
        </div>
      )}
      <label>
        Restore a JSON backup as new items
        <input
          type="file"
          accept="application/json"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            cancel.current = false;
            try {
              if (file.size > 100 * 1024 * 1024)
                throw Error(
                  "Backup exceeds 100 MiB; split it before importing",
                );
              setReport(
                await importBackup(
                  uid,
                  JSON.parse(await file.text()),
                  () => cancel.current,
                ),
              );
            } catch (e) {
              setError(String(e));
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
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
          {report.completed.length} restored · {report.skipped.length} skipped ·{" "}
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
