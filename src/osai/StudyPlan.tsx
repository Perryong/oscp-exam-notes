import { Link } from "react-router-dom";
import { useState } from "react";
import { useWorkspaceNotebook } from "../notebook/NotebookContext";
import { changeMachine } from "../notebook/MachineView";
import { vaultModules, vaultPhases, osaiSeedMachines } from "./seeds";
import type { MachineContent } from "../notebook/model";
const steps = [
  ["vault-read", "Read"],
  ["vault-practise", "Practise"],
  ["vault-document", "Document findings"],
  ["vault-review", "Review"],
] as const;
export default function StudyPlan({ uid }: { uid?: string }) {
  const { machines } = useWorkspaceNotebook("osai"),
    [error, setError] = useState("");
  const targets = vaultModules.map(
    (module) =>
      machines.find((m) => m.id === module.id) ||
      osaiSeedMachines.find((m) => m.id === module.id)!,
  );
  const done = targets.filter((m) => m.content.progress === "completed").length;
  async function save(id: string, change: Partial<MachineContent>) {
    if (!uid) return;
    setError("");
    try {
      await changeMachine(uid, id, change);
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <section className="page">
      <div className="osai-study-hero">
        <p className="eyebrow">OSAI / VAULT STUDY PLAN</p>
        <h1>Your path through all 23 modules.</h1>
        <p>
          A self-paced plan: read each module, practise in your lab, document
          findings, and review what you learned.
        </p>
        <Link to="/osai/library/osai-vault">Open OSAI Vault →</Link>
      </div>
      <div className="section-title">
        <h2>Your learning path</h2>
        <span>
          {done} / {vaultModules.length} completed
        </span>
      </div>
      {!uid && (
        <p>
          <Link to="/settings">Sign in</Link> to save progress and study
          checklists across your devices.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {vaultPhases.map((phase) => (
        <section key={phase}>
          <h2>{phase}</h2>
          <div className="osai-grid">
            {vaultModules
              .filter((m) => m.phase === phase)
              .map((module) => {
                const target = targets[module.number];
                const href = "/osai/library/osai-vault#" + module.anchor;
                return (
                  <article className="week-card" key={module.id}>
                    <div>
                      <span className="eyebrow">
                        MODULE {String(module.number).padStart(2, "0")}
                      </span>
                      <h3>
                        <Link to={href}>{module.title}</Link>
                      </h3>
                      <fieldset className="vault-checklist">
                        <legend>Study checklist</legend>
                        {steps.map(([tag, label]) => (
                          <label key={tag}>
                            <input
                              type="checkbox"
                              disabled={!uid}
                              aria-label={label + ": " + module.title}
                              checked={target.content.tags.includes(tag)}
                              onChange={(e) =>
                                void save(target.id, {
                                  tags: e.target.checked
                                    ? [...target.content.tags, tag]
                                    : target.content.tags.filter(
                                        (t) => t !== tag,
                                      ),
                                })
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </fieldset>
                      {uid && (
                        <label>
                          Progress
                          <select
                            aria-label={"Progress for " + module.title}
                            value={target.content.progress}
                            onChange={(e) =>
                              void save(target.id, {
                                progress: e.target
                                  .value as MachineContent["progress"],
                              })
                            }
                          >
                            <option value="not-started">Not started</option>
                            <option value="in-progress">In progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </label>
                      )}
                      <p>
                        <Link to={href}>Read vault module →</Link>
                      </p>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
      <p className="quiet">
        Progress is specific to these 23 vault modules. Your earlier
        seven-module progress and notes remain available in Labs and the
        Learning library. Completing the checklist does not automatically mark a
        module completed.
      </p>
      <p>
        <Link to="/osai/library/exam-preparation">
          Exam preparation reference
        </Link>{" "}
        · <Link to="/osai/library">Learning library</Link>
      </p>
    </section>
  );
}
