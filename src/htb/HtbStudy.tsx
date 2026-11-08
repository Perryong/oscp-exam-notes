import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspaceNotebook } from "../notebook/NotebookContext";
import { changeMachine } from "../notebook/MachineView";
import { ensureHtbWeekNote } from "./actions";
import {
  modules,
  schedule,
  studyWeeks,
  sessionsForWeek,
  htbModuleId,
} from "./model";
import "./htb.css";
const dayMs = 86400000;
const dateOf = (s: string) => new Date(s + "T00:00:00Z");
const iso = (d: Date) => d.toISOString().slice(0, 10);
const label = (s: string) =>
  dateOf(s).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
function browserProgress(): Record<string, number> {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("oscp-ladder") || "{}",
    );
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, number>)
      : {};
  } catch {
    return {};
  }
}
export default function HtbStudy({
  uid,
  calendar = false,
}: {
  uid?: string;
  calendar?: boolean;
}) {
  const { machines } = useWorkspaceNotebook("oscp"),
    navigate = useNavigate(),
    [params, setParams] = useSearchParams();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const requested = Number(params.get("week")),
    current =
      studyWeeks.find((w) => w.start <= today && w.end >= today)?.week ||
      (today < studyWeeks[0].start ? 1 : 51);
  const weekNumber =
    Number.isInteger(requested) && requested >= 1 && requested <= 51
      ? requested
      : current;
  const week = studyWeeks[weekNumber - 1];
  const [mode, setMode] = useState<"week" | "month">("week"),
    [month, setMonth] = useState(week.start.slice(0, 7));
  const [local, setLocal] = useState(browserProgress),
    [pending, setPending] = useState<number | null>(null),
    [opening, setOpening] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setLocal(browserProgress());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const completed = (id: number) =>
    uid
      ? machines.find((m) => m.id === htbModuleId(id))?.content.progress ===
        "completed"
      : local[htbModuleId(id)] === 1;
  async function toggle(id: number, checked: boolean) {
    setError("");
    if (!uid) {
      try {
        const next = browserProgress();
        if (checked) next[htbModuleId(id)] = 1;
        else delete next[htbModuleId(id)];
        localStorage.setItem("oscp-ladder", JSON.stringify(next));
        setLocal(next);
      } catch {
        setError("Couldn't save module completion in this browser.");
      }
      return;
    }
    setPending(id);
    try {
      await changeMachine(uid, htbModuleId(id), {
        progress: checked ? "completed" : "not-started",
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setPending(null);
    }
  }
  async function openNotes(n: number) {
    if (!uid || opening) return;
    setOpening(true);
    setError("");
    try {
      const id = await ensureHtbWeekNote(uid, n);
      navigate("/notes/" + encodeURIComponent(id));
    } catch (e) {
      setError(String(e));
    } finally {
      setOpening(false);
    }
  }
  function choose(n: number) {
    const next = Math.max(1, Math.min(51, n));
    setParams({ week: String(next) });
    setMonth(studyWeeks[next - 1].start.slice(0, 7));
  }
  const noteAction = (n: number) =>
    uid ? (
      <button disabled={opening} onClick={() => void openNotes(n)}>
        Open HTB week {n} notes
      </button>
    ) : (
      <Link to="/settings">Sign in for HTB week {n} notes</Link>
    );
  function moduleAction(id: number) {
    const module = modules.find((m) => m.id === id)!;
    return (
      <label className="htb-completion">
        <input
          type="checkbox"
          aria-label={"Module complete: " + module.title}
          checked={completed(id)}
          disabled={pending !== null}
          onChange={(e) => void toggle(id, e.target.checked)}
        />
        Module complete
      </label>
    );
  }
  const sessions = sessionsForWeek(weekNumber);
  const first = dateOf(month + "-01"),
    gridStart = +first - ((first.getUTCDay() + 6) % 7) * dayMs;
  const days = Array.from({ length: 42 }, (_, n) =>
    iso(new Date(gridStart + n * dayMs)),
  );
  const monthSessions = studyWeeks.flatMap((w) => sessionsForWeek(w.week));
  return (
    <section className="page htb-study">
      <p className="eyebrow">OSCP / HTB ACADEMY</p>
      <h1>{calendar ? "HTB study calendar" : "HTB study schedule"}</h1>
      <p>
        10 hours each week: four 2-hour module or lab sessions on Monday,
        Wednesday, Thursday and Saturday; a 2-hour independent retry and notes
        session on Sunday.
      </p>
      <div className="row">
        <Link to="/htb-study">Full schedule</Link>
        <Link to={"/calendar?week=" + weekNumber}>Calendar</Link>
        <a href="/getting-started.html">Getting Started guide</a>
        <a href="/learning-process.html#weekly-template-guide">
          Learning Process &amp; testing guide
        </a>
      </div>
      <p className="quiet">
        HTB snapshot {schedule.checked_on}: 3% complete, Penetration Testing
        Process completed, Getting Started in progress. These checkboxes track
        your notebook progress, not your HTB account.{" "}
        {uid
          ? "Progress and notes use your existing account sync."
          : "Completion saves in this browser. Sign in to sync new progress and open private weekly notes."}
      </p>
      <p>
        <strong>
          {modules.filter((m) => completed(m.id)).length} / 27 scheduled modules
          complete
        </strong>{" "}
        · 51 weeks · 9 November 2026 – 31 October 2027
      </p>
      {error && (
        <p role="alert">
          {error}{" "}
          <Link to="/settings">Settings / Import previous notebook</Link>
        </p>
      )}
      {calendar ? (
        <>
          <div className="htb-controls">
            <label>
              Study week{" "}
              <select
                value={weekNumber}
                onChange={(e) => choose(Number(e.target.value))}
              >
                {studyWeeks.map((w) => (
                  <option key={w.week} value={w.week}>
                    Week {w.week} · {label(w.start)}
                  </option>
                ))}
              </select>
            </label>
            <div role="group" aria-label="Calendar view">
              <button
                aria-pressed={mode === "week"}
                onClick={() => setMode("week")}
              >
                Week
              </button>
              <button
                aria-pressed={mode === "month"}
                onClick={() => setMode("month")}
              >
                Month
              </button>
            </div>
          </div>
          <div className="htb-controls">
            <button
              aria-label="Previous calendar period"
              disabled={mode === "week" && weekNumber === 1}
              onClick={() =>
                mode === "week"
                  ? choose(weekNumber - 1)
                  : setMonth(
                      iso(
                        new Date(
                          Date.UTC(
                            first.getUTCFullYear(),
                            first.getUTCMonth() - 1,
                            1,
                          ),
                        ),
                      ).slice(0, 7),
                    )
              }
            >
              Previous
            </button>
            <strong>
              {mode === "week"
                ? `${label(week.start)} – ${label(week.end)}`
                : first.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
            </strong>
            <button
              aria-label="Next calendar period"
              disabled={mode === "week" && weekNumber === 51}
              onClick={() =>
                mode === "week"
                  ? choose(weekNumber + 1)
                  : setMonth(
                      iso(
                        new Date(
                          Date.UTC(
                            first.getUTCFullYear(),
                            first.getUTCMonth() + 1,
                            1,
                          ),
                        ),
                      ).slice(0, 7),
                    )
              }
            >
              Next
            </button>
          </div>
          {mode === "month" && (
            <div className="htb-month" aria-label="Study month">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="htb-dow">
                  {d}
                </span>
              ))}
              {days.map((d) => {
                const w = studyWeeks.find((w) => w.start <= d && w.end >= d),
                  entries = monthSessions.filter((s) => s.date === d);
                return (
                  <button
                    key={d}
                    disabled={!w}
                    className={
                      (d.slice(0, 7) !== month ? "htb-out " : "") +
                      (w?.week === weekNumber ? "htb-selected" : "")
                    }
                    aria-label={`${label(d)} · ${entries.reduce((n, s) => n + s.hours, 0)} hours${w ? ` · HTB week ${w.week}` : ""}`}
                    onClick={() => w && setParams({ week: String(w.week) })}
                  >
                    <strong>{dateOf(d).getUTCDate()}</strong>
                    {entries.length > 0 && (
                      <>
                        <span>
                          {entries.reduce((n, s) => n + s.hours, 0)} h
                        </span>
                        <small>{entries.map((s) => s.title).join(" / ")}</small>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <article className="htb-week-heading">
            <div>
              <h2>HTB week {weekNumber} · 10 hours</h2>
              <p>{week.kind}</p>
            </div>
            {noteAction(weekNumber)}
          </article>
          <div className="htb-sessions">
            {Array.from({ length: 7 }, (_, n) =>
              iso(new Date(+dateOf(week.start) + n * dayMs)),
            ).map((d) => (
              <article className="week-card" key={d}>
                <h3>
                  {dateOf(d).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
                </h3>
                {sessions
                  .filter((s) => s.date === d)
                  .map((s, i) => (
                    <div className="htb-session" key={i}>
                      <strong>
                        {s.title} · {s.hours} h
                      </strong>
                      {s.moduleId !== null && (
                        <>
                          <p>
                            <a
                              href={
                                modules.find((m) => m.id === s.moduleId)!.source
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open module ↗
                            </a>
                          </p>
                          {moduleAction(s.moduleId)}
                        </>
                      )}
                    </div>
                  ))}
                {!sessions.some((s) => s.date === d) && (
                  <p className="quiet">Rest or revisit this week’s notes.</p>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>
            348 planned course hours, 102 hours of weekly review, and 60 hours
            of catch-up or independent replay. Day estimates use an explicit
            planning assumption of 8 study hours per day. Dates are a flexible
            baseline; reassess at the seven checkpoint weeks.
          </p>
          <div className="htb-table">
            <table>
              <thead>
                <tr>
                  <th>Week / dates</th>
                  <th>Course and practice · 8 h</th>
                  <th>Review · 2 h</th>
                </tr>
              </thead>
              <tbody>
                {studyWeeks.map((w) => (
                  <tr key={w.week}>
                    <th scope="row">
                      <Link to={"/calendar?week=" + w.week}>
                        HTB week {w.week}
                      </Link>
                      <small>
                        {label(w.start)} – {label(w.end)}
                      </small>
                    </th>
                    <td>
                      {w.allocations.map((a) => {
                        const m = modules.find((m) => m.id === a.module)!;
                        return (
                          <div key={a.module}>
                            <a href={m.source} target="_blank" rel="noreferrer">
                              {m.title}
                            </a>{" "}
                            · {a.hours} h{moduleAction(m.id)}
                          </div>
                        );
                      })}
                      {w.practice_hours > 0 && (
                        <p>
                          Catch-up or independent practice · {w.practice_hours}{" "}
                          h
                        </p>
                      )}
                    </td>
                    <td>
                      <p>Independent retry, evidence and weekly reflection.</p>
                      {noteAction(w.week)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="quiet">
        For notes saved in the previous site, use Settings → Import previous
        notebook. Browser-only completion and signed-in progress are separate.
      </p>
    </section>
  );
}
