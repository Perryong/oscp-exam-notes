import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { seedMachines } from "./seeds";
import { useNotebook } from "./NotebookContext";
import { combined, editDraft, createNote } from "./repository";
import ConflictPanel from "../persistence/ConflictPanel";
import type { Conflict } from "../persistence/sync";
import { getMeta, listDrafts, saveDraft } from "../persistence/local";
import type { MachineContent, Saved } from "./model";
export async function changeMachine(
  uid: string,
  id: string,
  change: Partial<MachineContent>,
) {
  const value =
    (await combined<MachineContent>(uid, "machine")).find((m) => m.id === id) ||
    seedMachines.find((m) => m.id === id);
  if (!value) throw Error("Machine unavailable");
  const draft = await editDraft(uid, "machine", value);
  const result = await saveDraft(
    {
      ...draft,
      content: { ...draft.content, ...change },
      mutationId: crypto.randomUUID(),
    },
    draft.localRevision,
  );
  if (result.kind === "conflict")
    throw Error(
      "Another tab changed this machine. Your edit is retained for recovery.",
    );
}
export default function MachineView({ uid }: { uid: string }) {
  const { machines, notes } = useNotebook(),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    navigate = useNavigate();
  const [conflicts, setConflicts] = useState<Conflict<MachineContent>[]>([]);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const pending = await listDrafts<MachineContent>(uid, "machine");
      const items = await Promise.all(
        pending.map((d) =>
          getMeta<Conflict<MachineContent>>(uid, "conflict:machine:" + d.id),
        ),
      );
      if (alive)
        setConflicts(
          items.filter((c): c is Conflict<MachineContent> => c !== null),
        );
    };
    const timer = setInterval(refresh, 1500);
    void refresh();
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [uid]);
  const all = [
    ...new Map([...seedMachines, ...machines].map((m) => [m.id, m])).values(),
  ];
  async function add() {
    const name = prompt("Machine name");
    if (!name) return;
    const id = crypto.randomUUID();
    await saveDraft(
      {
        uid,
        kind: "machine",
        id,
        content: {
          name,
          platform: "Custom",
          os: "",
          tags: [],
          legacyKey: null,
          week: null,
          progress: "not-started",
        },
        baseRevision: 0,
        localRevision: 0,
        mutationId: crypto.randomUUID(),
        modifiedAt: Date.now(),
      },
      0,
    );
  }
  return (
    <section className="page">
      <h1>Machines</h1>
      {conflicts.map((c) => (
        <ConflictPanel
          key={c.draft.id}
          uid={uid}
          kind="machine"
          id={c.draft.id}
          conflict={c}
          onResolved={() =>
            setConflicts((all) => all.filter((x) => x.draft.id !== c.draft.id))
          }
        />
      ))}
      <div className="row">
        <input
          aria-label="Search machines"
          placeholder="Search machines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={() => void add().catch((e) => setError(String(e)))}>
          Add machine
        </button>
      </div>
      {all
        .filter((m) =>
          `${m.content.name} ${m.content.platform} ${m.content.os}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .map((m) => (
          <article className="week-card" key={m.id}>
            <div>
              <h2>{m.content.name}</h2>
              <label>
                Name
                <input
                  aria-label={"Name for " + m.content.name}
                  defaultValue={m.content.name}
                  onBlur={(e) => {
                    if (e.target.value !== m.content.name)
                      void changeMachine(uid, m.id, {
                        name: e.target.value,
                      }).catch((e) => setError(String(e)));
                  }}
                />
              </label>
              <div className="row">
                {(["platform", "os"] as const).map((field) => (
                  <label key={field}>
                    {field}
                    <input
                      defaultValue={m.content[field]}
                      onBlur={(e) => {
                        if (e.target.value !== m.content[field])
                          void changeMachine(uid, m.id, {
                            [field]: e.target.value,
                          }).catch((e) => setError(String(e)));
                      }}
                    />
                  </label>
                ))}
                <select
                  aria-label={"Progress for " + m.content.name}
                  value={m.content.progress}
                  onChange={(e) =>
                    void changeMachine(uid, m.id, {
                      progress: e.target.value as MachineContent["progress"],
                    }).catch((e) => setError(String(e)))
                  }
                >
                  <option value="not-started">Not started</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button
                onClick={() =>
                  void createNote(uid, m.id)
                    .then((id) => navigate("/notes/" + id))
                    .catch((e) => setError(String(e)))
                }
              >
                New note for {m.content.name}
              </button>
              {notes
                .filter(
                  (n) =>
                    n.content.machineId === m.id &&
                    n.content.deletedAt === null,
                )
                .map((n) => (
                  <p key={n.id}>
                    <Link to={"/notes/" + n.id}>{n.content.title}</Link>
                  </p>
                ))}
            </div>
          </article>
        ))}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
