import { workspaceOf } from "../workspaces/model";
import { machineWalkthrough } from "../walkthroughs/catalog";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNotebook } from "../notebook/NotebookContext";
import { changeMachine } from "../notebook/MachineView";
import ids from "./machine-ids.json";
import type { MachineContent } from "../notebook/model";
import ladder from "./ladder.json";
const phases = [
  { name: "Foundations", tiers: [1, 2] },
  { name: "Core", tiers: [3] },
  { name: "Stretch", tiers: [4] },
  { name: "Exam-plus", tiers: [5] },
  { name: "Networks", tiers: [6] },
];
type Box = (typeof ladder)[number]["boxes"][number];
export default function StudyPlan({ uid }: { uid?: string }) {
  const all = useNotebook();
  const machines = all.machines.filter(
    (m) => workspaceOf(m.content) === "oscp",
  );
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(0),
    [box, setBox] = useState<Box | null>(null);
  const weeks = ladder.filter((w) =>
    phases[phase].tiers.includes(Math.max(...w.boxes.map((b) => b.tier))),
  );
  return (
    <section className="page">
      <div className="eyebrow">A LITTLE PROGRESS, EVERY WEEK</div>
      <h1>Study plan</h1>
      <p className="subtitle">
        Your path from the first foothold to a complete write-up.
      </p>
      <div className="stats">
        <div>
          <strong>{ladder.length}</strong>
          <span>weeks of practice</span>
        </div>
        <div>
          <strong>{ladder.flatMap((w) => w.boxes).length}</strong>
          <span>machines & labs</span>
        </div>
        <div>
          <strong>{ladder.reduce((n, w) => n + w.hours, 0)}</strong>
          <span>planned hours</span>
        </div>
      </div>
      <div className="tabs" role="group" aria-label="Study phase">
        {phases.map((p, i) => (
          <button
            className={phase === i ? "selected" : ""}
            key={p.name}
            onClick={() => setPhase(i)}
            aria-pressed={phase === i}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="section-title">
        <h2>{phases[phase].name}</h2>
        <span>{weeks.length} weeks</span>
      </div>
      {weeks.map((w) => (
        <section className="week-card" key={w.week}>
          <div className="week-label">
            <small>WEEK</small>
            <strong>{String(w.week).padStart(2, "0")}</strong>
            <span>{w.hours} hours</span>
          </div>
          <div className="week-machines">
            {w.boxes.map((b, i) => (
              <article className="machine-row" key={b.platform + b.name + i}>
                <div>
                  <h3>{b.name}</h3>
                  <div className="tags">
                    <span>{b.platform}</span>
                    <span>{b.os}</span>
                    <span>{b.rating}</span>
                  </div>
                </div>
                <div>
                  {uid && (
                    <select
                      aria-label={"Progress for " + b.name}
                      value={
                        machines.find(
                          (m) =>
                            m.id ===
                            (ids as Record<string, string>)[
                              b.platform + "|" + b.name
                            ],
                        )?.content.progress || "not-started"
                      }
                      onChange={(e) =>
                        void changeMachine(
                          uid,
                          (ids as Record<string, string>)[
                            b.platform + "|" + b.name
                          ],
                          {
                            progress: e.target
                              .value as MachineContent["progress"],
                          },
                        ).catch((e) => setError(String(e)))
                      }
                    >
                      <option value="not-started">Not started</option>
                      <option value="in-progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                  <button
                    className="quiet"
                    aria-label={"Walkthrough for " + b.name}
                    onClick={() => setBox(b)}
                  >
                    Walkthrough ↗
                  </button>
                </div>
              </article>
            ))}
            {machines
              .filter(
                (m) =>
                  m.content.week === w.week &&
                  !Object.values(ids).includes(m.id),
              )
              .map((m) => (
                <article className="machine-row" key={m.id}>
                  <div>
                    <h3>
                      <Link to={"/machines#" + m.id}>{m.content.name}</Link>
                    </h3>
                    <div className="tags">
                      <span>{m.content.platform}</span>
                      <span>{m.content.os}</span>
                      {m.content.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <span>{m.content.progress.replaceAll("-", " ")}</span>
                </article>
              ))}
          </div>
        </section>
      ))}
      {error && <p role="alert">{error}</p>}
      {box && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={box.name + " walkthrough"}
          >
            <button
              className="close"
              aria-label="Close walkthrough"
              onClick={() => setBox(null)}
            >
              ×
            </button>
            <div className="eyebrow">WALKTHROUGH</div>
            <h2>{box.name}</h2>
            {machineWalkthrough(box.name, box.platform) && (
              <p>
                <Link
                  to={
                    "/walkthroughs/" +
                    machineWalkthrough(box.name, box.platform)!.id
                  }
                >
                  Read written walkthrough
                </Link>
              </p>
            )}
            {box.links.map((l, i) => (
              <p key={i}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.src} · {l.kind} ↗
                </a>
                {"note" in l && <small className="block">{l.note}</small>}
              </p>
            ))}
            {"outline" in box &&
              box.outline?.map(([seconds, title], i) => (
                <p key={i}>
                  <a
                    href={
                      (box.links.find((l) => l.src === "IppSec")?.url ||
                        "https://youtube.com") +
                      "&t=" +
                      seconds +
                      "s"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {Math.floor(Number(seconds) / 60)}:
                    {String(Number(seconds) % 60).padStart(2, "0")} — {title}
                  </a>
                </p>
              ))}
            <button onClick={() => setBox(null)}>Back to study plan</button>
          </section>
        </div>
      )}
    </section>
  );
}
