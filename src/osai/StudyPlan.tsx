import { Link } from "react-router-dom";
import { useState } from "react";
import { useWorkspaceNotebook } from "../notebook/NotebookContext";
import { changeMachine } from "../notebook/MachineView";
import { osaiGroups, osaiSeedMachines } from "./seeds";
import { osaiCatalog } from "./catalog";
import type { MachineContent } from "../notebook/model";
export default function StudyPlan({ uid }: { uid?: string }) {
  const { machines } = useWorkspaceNotebook("osai"),
    [error, setError] = useState("");
  const targets = osaiSeedMachines.map(
    (seed) => machines.find((m) => m.id === seed.id) || seed,
  );
  const done = targets.filter((m) => m.content.progress === "completed").length;
  return (
    <section className="page">
      <div className="osai-study-hero">
        <p className="eyebrow">OSAI / AI SECURITY FIELDNOTES</p>
        <h1>
          Study the boundary.
          <br />
          Document the evidence.
        </h1>
        <p>
          A practical path through AI applications, retrieval, agents, and
          infrastructure.
        </p>
        <Link to="/osai/library">Explore the learning library →</Link>
      </div>
      <div className="section-title">
        <h2>Your learning path</h2>
        <span>{done} / 7 completed</span>
      </div>
      {!uid && (
        <p>
          <Link to="/settings">Sign in</Link> to save progress and private lab
          notes.
        </p>
      )}
      <div className="osai-grid">
        {osaiGroups.map(([slug, title], i) => {
          const target = targets[i],
            article = osaiCatalog.find((a) => a.slug === slug)!;
          return (
            <article className="week-card" key={slug}>
              <div>
                <span className="eyebrow">
                  MODULE {String(i + 1).padStart(2, "0")}
                </span>
                <h2>
                  <Link to={"/osai/library/" + slug}>{title}</Link>
                </h2>
                <p>{article.summary}</p>
                {uid && (
                  <label>
                    Progress
                    <select
                      aria-label={"Progress for " + title}
                      value={target.content.progress}
                      onChange={(e) =>
                        void changeMachine(uid, target.id, {
                          progress: e.target
                            .value as MachineContent["progress"],
                        }).catch((e) => setError(String(e)))
                      }
                    >
                      <option value="not-started">Not started</option>
                      <option value="in-progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                )}
                <p>
                  <Link to={"/osai/library/" + slug}>Read lesson →</Link>
                </p>
              </div>
            </article>
          );
        })}
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="quiet">
        Original starter curriculum, informed by public sources. This is not the
        complete OffSec course.
      </p>
      <p>
        <Link to="/osai/library/exam-preparation">Exam preparation</Link> ·{" "}
        <Link to="/osai/library/owasp-2025">OWASP 2025 mapping</Link> ·{" "}
        <Link to="/osai/library/resources">Further reading</Link>
      </p>
    </section>
  );
}
