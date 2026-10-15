import { workspaceOf } from "../workspaces/model";
import { useEffect, useState } from "react";
import {
  downloadOffline,
  getOfflineReport,
  getStoredImageBytes,
} from "../persistence/offline";
import {
  listConflicts,
  listMeta,
  saveDraft,
  removeRecovery,
} from "../persistence/local";
import { cleanupHistory } from "../notebook/repository";
import type {
  Draft,
  NoteContent,
  MachineContent,
  OfflineReport,
} from "../notebook/model";
export default function Settings({ uid }: { uid: string }) {
  const [offline, setOffline] = useState<OfflineReport | null>(null),
    [size, setSize] = useState<number | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [recovery, setRecovery] = useState<Draft<NoteContent | MachineContent>[]>(
      [],
    ),
    [cleanup, setCleanup] = useState<string[]>([]);
  async function refresh() {
    setOffline(await getOfflineReport(uid));
    setRecovery(await listConflicts(uid));
    setCleanup(
      (await listMeta(uid, "purge:"))
        .filter((x) => x.value === true)
        .map((x) => x.name.slice(6)),
    );
  }
  useEffect(() => {
    void refresh().catch((e) => setError(String(e)));
  }, [uid]);
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Offline availability</h2>
      <p>Downloads include both OSCP and OSAI workspaces for this account.</p>
      <p>
        {offline?.complete
          ? "Downloaded snapshot verified on this device."
          : "Offline download is incomplete or unavailable."}
        {offline?.completedAt &&
          " Last completed: " + new Date(offline.completedAt).toLocaleString()}
      </p>
      <p>
        Download while online before relying on offline notes. Screenshots must
        be cached; external walkthrough links need a connection. Browser storage
        can be evicted.
      </p>
      <button
        disabled={busy}
        onClick={() =>
          void action(async () => setOffline(await downloadOffline(uid)))
        }
      >
        Download for offline
      </button>
      {offline?.missing.map((id) => (
        <p key={id}>{id}</p>
      ))}
      <h2>Screenshot storage</h2>
      <p>
        This action reads and downloads every stored image payload, including
        unused images, to calculate its size. Firestore reads may be billed.
      </p>
      <button
        disabled={busy}
        onClick={() =>
          void action(async () => setSize(await getStoredImageBytes(uid)))
        }
      >
        Calculate stored screenshot size
      </button>
      {size !== null && (
        <p>
          {(size / 1024 / 1024).toFixed(2)} MiB stored. Images are retained
          after note deletion.
        </p>
      )}
      <h2>Recovery drafts</h2>
      <p>
        Versions displaced by another tab or an explicit conflict decision
        remain here.
      </p>
      {recovery.map((d) => (
        <article key={d.mutationId}>
          <p>
            <strong>{workspaceOf(d.content).toUpperCase()}</strong> ·{" "}
            {"title" in d.content ? d.content.title : d.content.name}
          </p>
          <button
            disabled={busy}
            onClick={() =>
              void action(async () => {
                await saveDraft(
                  {
                    ...d,
                    id: crypto.randomUUID(),
                    baseRevision: 0,
                    localRevision: 0,
                    mutationId: crypto.randomUUID(),
                  },
                  0,
                );
                await removeRecovery(uid, d.mutationId);
              })
            }
          >
            Recover as a new {d.kind}
          </button>
        </article>
      ))}
      {cleanup.length > 0 && (
        <>
          <h2>Pending deleted-note history cleanup</h2>
          {cleanup.map((id) => (
            <button
              disabled={busy}
              key={id}
              onClick={() => void action(() => cleanupHistory(uid, id))}
            >
              Retry cleanup {id}
            </button>
          ))}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
