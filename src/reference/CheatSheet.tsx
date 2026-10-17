import { useState } from "react";
import cheatsheet from "./cheatsheet.json";
import imported from "./imported-cheatsheet.json";
export default function CheatSheet() {
  const [collection, setCollection] = useState("imported");
  const [topic, setTopic] = useState("");
  const [q, setQ] = useState(""),
    [message, setMessage] = useState("");
  const source =
    collection === "imported"
      ? imported.sections
      : cheatsheet.map((s) => ({ ...s, group: "Previous collection" }));
  const sections = source.filter(
    (s) =>
      (!topic || s.group === topic) &&
      (s.title + " " + s.text).toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <section className="page">
      <div className="eyebrow">KEEP YOUR COMMANDS CLOSE</div>
      <h1>Cheat sheet</h1>
      <p className="subtitle">
        A searchable reference for enumeration, access, and escalation.
      </p>
      <div className="row">
        <label>
          Collection{" "}
          <select
            value={collection}
            onChange={(e) => {
              setCollection(e.target.value);
              setTopic("");
              setQ("");
              setMessage("");
            }}
          >
            <option value="imported">
              OSCP Cheatsheet — full supplied notes
            </option>
            <option value="previous">Previous cheat sheet</option>
          </select>
        </label>
        <label>
          Topic{" "}
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>
            {[...new Set(source.map((s) => s.group))].map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
        </label>
      </div>
      {collection === "imported" && (
        <p>
          Full text from your OSCP-Cheatsheet archive · Source:{" "}
          <a
            href="https://s4thv1k.com/posts/oscp-cheatsheet/"
            target="_blank"
            rel="noopener noreferrer"
          >
            s4thv1k
          </a>{" "}
          ·{" "}
          <a href="/oscp-cheatsheet/README.md" download>
            Download original Markdown
          </a>
          <br />
          <span className="quiet">
            Examples are preserved from the supplied notes and have not been
            re-tested. This archive contains no images.
          </span>
        </p>
      )}
      <input
        type="search"
        aria-label="Search cheat sheet"
        placeholder="Search commands and techniques…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <p className="muted">
        {sections.length} of {source.length} sections{" "}
        <span role="status">{message}</span>
      </p>
      {!sections.length && <p>No sections match your search.</p>}
      {sections.map((s) => (
        <details
          className="reference-section"
          key={`${collection}-${s.id}`}
          open={!!q.trim()}
        >
          <summary>{s.title}</summary>
          <p className="eyebrow">{s.group}</p>
          <div
            className="reference-body"
            onClick={async (e) => {
              const button = (e.target as HTMLElement).closest(".copy-command");
              if (!button) return;
              try {
                await navigator.clipboard.writeText(
                  button.parentElement?.querySelector("pre")?.textContent || "",
                );
                setMessage("Copied code");
              } catch {
                setMessage("Copy unavailable. Select the text to copy.");
              }
            }}
            dangerouslySetInnerHTML={{ __html: s.html }}
          />
          {collection === "previous" && (
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
          )}
        </details>
      ))}
    </section>
  );
}
