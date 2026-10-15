import {
  workspaceOf,
  sameWorkspace,
  type WorkspaceId,
} from "../workspaces/model";
import { workspacePath } from "../workspaces/routes";
import { osaiSeedMachines } from "../osai/seeds";
import { machineWalkthrough } from "../walkthroughs/catalog";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateMachine } from "./validation";
import ladder from "../reference/ladder.json";
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
    [...seedMachines, ...osaiSeedMachines].find((m) => m.id === id);
  if (!value) throw Error("Machine unavailable");
  const draft = await editDraft(uid, "machine", value);
  const content = {
    ...draft.content,
    workspace: workspaceOf(draft.content),
    ...change,
  };
  if (!sameWorkspace(content, draft.content))
    throw Error("Cannot change workspace");
  validateMachine(content);
  if (content.week !== null && !ladder.some((w) => w.week === content.week))
    throw Error("Choose an existing study week");
  const result = await saveDraft(
    {
      ...draft,
      content,
      mutationId: crypto.randomUUID(),
    },
    draft.localRevision,
  );
  if (result.kind === "conflict")
    throw Error(
      "Another tab changed this machine. Your edit is retained for recovery.",
    );
}
export default function MachineView({
  uid,
  workspace = "oscp",
}: {
  uid: string;
  workspace?: WorkspaceId;
}) {
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
    ...new Map(
      [...seedMachines, ...osaiSeedMachines, ...machines].map((m) => [m.id, m]),
    ).values(),
  ];
  async function add() {
    const name = prompt(workspace === "osai" ? "Lab name" : "Machine name");
    if (!name) return;
    validateMachine({
      name,
      platform: "Custom",
      os: "",
      tags: [],
      legacyKey: null,
      week: null,
      progress: "not-started",
    });
    const id = crypto.randomUUID();
    await saveDraft(
      {
        uid,
        kind: "machine",
        id,
        content: {
          workspace,
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
      <h1>{workspace === "osai" ? "Labs & learning progress" : "Machines"}</h1>
      {conflicts
        .filter((c) => workspaceOf(c.draft.content) === workspace)
        .map((c) => (
          <ConflictPanel
            key={c.draft.id}
            uid={uid}
            kind="machine"
            id={c.draft.id}
            conflict={c}
            onResolved={() =>
              setConflicts((all) =>
                all.filter((x) => x.draft.id !== c.draft.id),
              )
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
          {workspace === "osai" ? "Add lab" : "Add machine"}
        </button>
      </div>
      {all
        .filter((m) => workspaceOf(m.content) === workspace)
        .filter((m) =>
          `${m.content.name} ${m.content.platform} ${m.content.os} ${m.content.tags.join(" ")} ${m.content.week || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .map((m) => (
          <article className="week-card" key={m.id} id={m.id}>
            <div>
              <h2>{m.content.name}</h2>
              {machineWalkthrough(m.content.name, m.content.platform) && (
                <p>
                  <Link
                    to={
                      "/walkthroughs/" +
                      machineWalkthrough(m.content.name, m.content.platform)!.id
                    }
                  >
                    Read written walkthrough
                  </Link>
                </p>
              )}
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
                <label>
                  Week
                  <input
                    type="number"
                    min="1"
                    max={ladder.length}
                    aria-label={"Week for " + m.content.name}
                    defaultValue={m.content.week || ""}
                    onBlur={(e) => {
                      const week = e.target.value
                        ? Number(e.target.value)
                        : null;
                      if (week !== m.content.week)
                        void changeMachine(uid, m.id, { week }).catch((e) =>
                          setError(String(e)),
                        );
                    }}
                  />
                </label>
                <label>
                  Tags
                  <input
                    aria-label={"Tags for " + m.content.name}
                    defaultValue={m.content.tags.join(", ")}
                    onBlur={(e) => {
                      const tags = [
                        ...new Set(
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        ),
                      ];
                      if (
                        JSON.stringify(tags) !== JSON.stringify(m.content.tags)
                      )
                        void changeMachine(uid, m.id, { tags }).catch((e) =>
                          setError(String(e)),
                        );
                    }}
                  />
                </label>
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
                  void createNote(uid, m.id, workspace)
                    .then((id) =>
                      navigate(workspacePath(workspace, "notes", id)),
                    )
                    .catch((e) => setError(String(e)))
                }
              >
                New note for {m.content.name}
              </button>
              {notes
                .filter(
                  (n) =>
                    workspaceOf(n.content) === workspace &&
                    n.content.machineId === m.id &&
                    n.content.deletedAt === null,
                )
                .map((n) => (
                  <p key={n.id}>
                    <Link to={workspacePath(workspace, "notes", n.id)}>
                      {n.content.title}
                    </Link>
                  </p>
                ))}
            </div>
          </article>
        ))}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
