import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useNotebook } from "./NotebookContext";
import { createNote, editDraft, trashNote } from "./repository";
import { searchNotes } from "./search";
import type { Draft, NoteContent, MachineContent } from "./model";
import NoteEditor, { beforeLeaveEditor } from "../editor/NoteEditor";
import { loadImage } from "../firebase/images";
import { getMeta } from "../persistence/local";
import { getSyncStatus, type Conflict } from "../persistence/sync";
import ConflictPanel from "../persistence/ConflictPanel";
import RecoveryPanel from "../persistence/RecoveryPanel";
export default function NotebookView({
  uid,
  topics = false,
}: {
  uid: string;
  topics?: boolean;
}) {
  const { notes, machines } = useNotebook(),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    navigate = useNavigate();
  return (
    <section className="page">
      <p className="eyebrow">YOUR PRIVATE NOTES</p>
      <h1>{topics ? "Topics" : "All notes"}</h1>
      <div className="row">
        <input
          aria-label="Search notes"
          placeholder="Search commands, titles, tags or machines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={() =>
            void createNote(uid)
              .then((id) => navigate("/notes/" + id))
              .catch((e) => setError(String(e)))
          }
        >
          New note
        </button>
        <Link to="/trash">Trash</Link>
      </div>
      {topics && (
        <div className="tags">
          {[...new Set(notes.flatMap((n) => n.content.tags))].map((t) => (
            <button key={t} onClick={() => setQuery(t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <p className="quiet">
        Showing notes available on this device; cloud updates arrive when
        connected.
      </p>
      {searchNotes(notes, machines, query).map((n) => (
        <article className="week-card" key={n.id}>
          <div>
            <Link to={"/notes/" + n.id}>
              <h2>{n.content.title || "Untitled note"}</h2>
            </Link>
            <p>{n.content.text.slice(0, 180)}</p>
            <div className="tags">
              {n.content.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
export function NotePage({ uid }: { uid: string }) {
  const { id = "" } = useParams(),
    { notes, machines } = useNotebook(),
    [draft, setDraft] = useState<Draft<NoteContent> | null>(null),
    [reload, setReload] = useState(0),
    [status, setStatus] = useState("Saved locally"),
    [conflict, setConflict] = useState<Conflict<
      NoteContent | MachineContent
    > | null>(null),
    [error, setError] = useState("");
  const edited = useRef(false);
  const navigate = useNavigate(),
    value = notes.find((n) => n.id === id);
  useEffect(() => {
    let alive = true;
    if (
      value &&
      (!draft || (!edited.current && value.revision > draft.baseRevision))
    )
      void editDraft(uid, "note", value).then((d) => {
        if (alive && (!draft || !edited.current)) setDraft(d);
      });
    return () => {
      alive = false;
    };
  }, [uid, id, value, draft, reload]);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const s = await getSyncStatus(uid, "note", id),
        c = await getMeta<Conflict<NoteContent>>(uid, "conflict:note:" + id);
      if (alive) {
        setStatus(s?.state || "Saved locally");
        setConflict(c);
        if (s?.error) setError(s.error);
      }
    };
    const timer = setInterval(refresh, 1000);
    void refresh();
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [uid, id]);
  function refresh() {
    edited.current = false;
    setDraft(null);
    setReload((x) => x + 1);
  }
  if (!value || value.content.deletedAt !== null)
    return (
      <section className="page">
        <h1>Note unavailable</h1>
        <p>This note may be in Trash, deleted, or not downloaded yet.</p>
        <Link to="/notes">Back to notes</Link>
      </section>
    );
  return (
    <section
      className="page"
      onInputCapture={() => {
        edited.current = true;
      }}
    >
      <Link to="/notes">← All notes</Link>
      <div className="row">
        <button
          onClick={() =>
            void navigator.clipboard
              .writeText(location.origin + "/notes/" + id)
              .catch(() => setError("Copy the URL from your address bar."))
          }
        >
          Copy note link
        </button>
        <button
          onClick={() =>
            void beforeLeaveEditor()
              .then(async (ok) => {
                if (ok) {
                  await trashNote(uid, id);
                  navigate("/notes");
                }
              })
              .catch((e) => setError(String(e)))
          }
        >
          Move to trash
        </button>
        <button
          onClick={() => window.dispatchEvent(new Event("notebook-retry"))}
        >
          Retry sync
        </button>
        <span role="status">{status}</span>
      </div>
      {conflict && (
        <ConflictPanel
          uid={uid}
          kind="note"
          id={id}
          conflict={conflict}
          onResolved={refresh}
        />
      )}
      {draft && (
        <NoteEditor
          key={id + ":" + reload + ":" + draft.baseRevision}
          uid={uid}
          draft={draft}
          machines={machines}
          onDraft={() => setStatus("Saved locally")}
          loadImage={(image) => loadImage(uid, image)}
        />
      )}
      <RecoveryPanel uid={uid} id={id} onRestored={refresh} />
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
