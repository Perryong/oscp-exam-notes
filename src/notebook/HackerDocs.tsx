import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createNote } from "./repository";
import {
  hackerLessons,
  hackerLessonPath,
  hackerLessonNote,
  hackerSource,
} from "./hackerDocsContent";

export default function HackerDocs({ id, uid }: { id: string; uid?: string }) {
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [id]);
  const index = hackerLessons.findIndex(
    (lesson) => `hacker-docs--${lesson.id}` === id,
  );
  const lesson = hackerLessons[index];
  const matches = hackerLessons.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.trim().toLowerCase()),
  );
  async function copyLesson() {
    if (!lesson || !uid || saving) return;
    setSaving(true);
    setError("");
    try {
      const noteId = await createNote(
        uid,
        null,
        "oscp",
        hackerLessonNote(lesson),
      );
      navigate(`/notes/${noteId}`);
    } catch (e) {
      setError(
        `Unable to copy this lesson: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="page">
      <Link to="/knowledge-vault">← Knowledge Vault</Link>
      <p className="eyebrow">OSCP / HACKER-DOCS STUDY COLLECTION</p>
      {id === "hacker-docs" ? (
        <>
          <h1>Network to web. Understand each observation.</h1>
          <p>
            12 original lessons, in study order, with diagrams, examples and
            troubleshooting. Topic readings are credited to
            ghostware0x00/Hacker-DOCS; these are curated teaching notes, not a
            full repository import.
          </p>
          <p className="quiet">
            Shared reference lessons · Your editable copies stay private ·
            Reviewed 17 October 2026
          </p>
          <input
            type="search"
            aria-label="Search Hacker-DOCS lessons"
            placeholder="Search concepts, commands or troubleshooting…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p role="status">
            {matches.length} of {hackerLessons.length} lessons
          </p>
          <div className="osai-grid">
            {matches.map((item) => (
              <article className="week-card" key={item.id}>
                <div>
                  <p className="eyebrow">
                    Lesson{" "}
                    {String(hackerLessons.indexOf(item) + 1).padStart(2, "0")} ·{" "}
                    {item.group}
                  </p>
                  <h2>
                    <Link to={hackerLessonPath(item.id)}>{item.title}</Link>
                  </h2>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
          {!matches.length && <p>No lessons match. Try a broader topic.</p>}
        </>
      ) : !lesson ? (
        <>
          <h1>Lesson not found.</h1>
          <Link to="/knowledge-vault/hacker-docs">
            ← All Hacker-DOCS lessons
          </Link>
        </>
      ) : (
        <>
          <Link to="/knowledge-vault/hacker-docs">
            ← All Hacker-DOCS lessons
          </Link>
          <p className="eyebrow">
            Lesson {index + 1} of {hackerLessons.length} · {lesson.group}
          </p>
          <h1>{lesson.title}</h1>
          <p className="lead">{lesson.summary}</p>
          <p className="quiet">
            Original Fieldnotes explanation and diagram · Community topic
            reference: ghostware0x00/Hacker-DOCS
          </p>
          {uid ? (
            <button disabled={saving} onClick={() => void copyLesson()}>
              {saving ? "Copying…" : "Copy lesson to my notes"}
            </button>
          ) : (
            <Link to="/settings">Sign in to copy this lesson</Link>
          )}
          <p className="quiet">
            Creates a private editable copy with the full text, example, source
            links and a text version of the diagram.
          </p>
          {error && <p role="alert">{error}</p>}
          <nav className="lesson-toc" aria-label="Lesson contents">
            {[
              "concept",
              "study-steps",
              "example",
              "observations",
              "troubleshooting",
              "sources",
            ].map((anchor) => (
              <a key={anchor} href={`#${anchor}`}>
                {anchor.replaceAll("-", " ")}
              </a>
            ))}
          </nav>
          <div className="walkthrough-body">
            <h2 id="concept">Concept</h2>
            <p>{lesson.explanation}</p>
            <figure>
              <svg
                role="img"
                aria-label={`${lesson.title} learning flow: ${lesson.flow.join(" → ")}`}
                viewBox="0 0 720 320"
                width="720"
                height="320"
                style={{ maxWidth: "100%", height: "auto" }}
              >
                <rect width="720" height="320" rx="16" fill="#173d38" />
                {lesson.flow.map((label, i) => (
                  <g key={label}>
                    <rect
                      x="24"
                      y={16 + i * 76}
                      width="672"
                      height="56"
                      rx="8"
                      fill="#e7f4ed"
                    />
                    <text
                      x="46"
                      y={51 + i * 76}
                      fill="#173d38"
                      fontSize="22"
                      fontFamily="system-ui"
                    >
                      {i + 1}. {label}
                    </text>
                    {i < lesson.flow.length - 1 && (
                      <text
                        x="356"
                        y={91 + i * 76}
                        fill="#e7f4ed"
                        fontSize="20"
                      >
                        ↓
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              <figcaption>Learning flow · {lesson.flow.join(" → ")}</figcaption>
            </figure>
            <h2 id="study-steps">Study steps</h2>
            <ol>
              {lesson.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h2 id="example">Example / worksheet</h2>
            <p>
              Examples illustrate the concept; use assigned labs or systems you
              control. Results depend on your environment.
            </p>
            <pre>
              <code>{lesson.example}</code>
            </pre>
            <h2 id="observations">Expected observations</h2>
            <p>{lesson.observation}</p>
            <h2 id="troubleshooting">Troubleshooting</h2>
            <p>{lesson.troubleshooting}</p>
            <h2 id="sources">Sources and further reading</h2>
            <ul>
              <li>
                <a
                  href={hackerSource(lesson)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hacker-DOCS source notes
                </a>{" "}
                · ghostware0x00 · Snapshot c430f79
              </li>
              <li>
                <a
                  href={lesson.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Primary reference
                </a>
              </li>
            </ul>
          </div>
          <nav className="row" aria-label="Lesson navigation">
            {index > 0 && (
              <Link to={hackerLessonPath(hackerLessons[index - 1].id)}>
                ← {hackerLessons[index - 1].title}
              </Link>
            )}
            {index < hackerLessons.length - 1 && (
              <Link to={hackerLessonPath(hackerLessons[index + 1].id)}>
                {hackerLessons[index + 1].title} →
              </Link>
            )}
          </nav>
        </>
      )}
    </section>
  );
}
