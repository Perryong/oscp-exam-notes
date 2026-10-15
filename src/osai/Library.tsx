import { useState } from "react";
import { Link } from "react-router-dom";
import { osaiCatalog } from "./catalog";
export default function Library() {
  const [query, setQuery] = useState("");
  const results = osaiCatalog.filter((a) =>
    (a.title + " " + a.summary + " " + a.owasp.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="page">
      <p className="eyebrow">OSAI / REFERENCE LIBRARY</p>
      <h1>Learn the system. Test the boundary.</h1>
      <p>
        Original study guides, practical checklists, and attributed resources. A
        starting point for your AI security notebook.
      </p>
      <input
        aria-label="Search OSAI library"
        placeholder="Search topics or OWASP identifiers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="quiet">
        {results.length} resources · Readings require a connection to load.
      </p>
      <div className="osai-grid">
        {results.map((a) => (
          <article className="week-card" key={a.slug}>
            <div>
              <span className="eyebrow">{a.group}</span>
              <h2>
                <Link to={"/osai/library/" + a.slug}>{a.title}</Link>
              </h2>
              <p>{a.summary}</p>
              <div className="tags">
                {a.owasp.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!results.length && <p>No matching resources. Try a broader topic.</p>}
    </section>
  );
}
