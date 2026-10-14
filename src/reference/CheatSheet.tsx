import { useState } from "react";
import cheatsheet from "./cheatsheet.json";
export default function CheatSheet() {
  const [q, setQ] = useState(""),
    [message, setMessage] = useState("");
  const sections = cheatsheet.filter((s) =>
    (s.title + " " + s.text).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <section className="page">
      <div className="eyebrow">KEEP YOUR COMMANDS CLOSE</div>
      <h1>Cheat sheet</h1>
      <p className="subtitle">
        A searchable reference for enumeration, access, and escalation.
      </p>
      <input
        type="search"
        aria-label="Search cheat sheet"
        placeholder="Search commands and techniques…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <p className="muted">
        {sections.length} sections <span role="status">{message}</span>
      </p>
      {sections.map((s) => (
        <details className="reference-section" key={s.id} open={!!q}>
          <summary>{s.title}</summary>
          <div
            className="reference-body"
            dangerouslySetInnerHTML={{ __html: s.html }}
          />
          <button
            className="quiet"
            aria-label="Copy code"
            onClick={async (e) => {
              const root = e.currentTarget.closest("details");
              const text =
                [...root!.querySelectorAll("pre")]
                  .map((p) => p.textContent)
                  .join("\n\n") || s.text;
              try {
                await navigator.clipboard.writeText(text);
                setMessage("Copied");
              } catch {
                setMessage("Copy unavailable. Select the text to copy.");
              }
            }}
          >
            Copy code
          </button>
        </details>
      ))}
    </section>
  );
}
