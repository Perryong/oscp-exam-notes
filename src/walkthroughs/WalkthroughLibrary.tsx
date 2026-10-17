import { useState } from "react";
import { Link } from "react-router-dom";
import { catalog, categoryName } from "./catalog";
export default function WalkthroughLibrary() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [track, setTrack] = useState("");
  const articles = catalog.articles.filter(
    (a) =>
      (!category || a.category === category) &&
      (!track || a.tracks?.includes(track)) &&
      `${a.title} ${categoryName(a.category)} ${a.searchText} ${a.excerpt} ${a.format ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="page walkthrough-library">
      <div className="eyebrow">READ. PRACTISE. TAKE NOTES.</div>
      <h1>Written walkthroughs</h1>
      <p className="subtitle">
        Written walkthroughs and illustrated study guides, with screenshots,
        reading steps and credited sources.
      </p>
      <p>
        <button
          type="button"
          onClick={() => {
            setQuery("Conceptual walkthrough");
            setCategory("");
            setTrack("");
          }}
        >
          Show{" "}
          {
            catalog.articles.filter(
              (a) => a.format === "Conceptual walkthrough",
            ).length
          }{" "}
          updated guides
        </button>{" "}
        Concept explanations, diagrams, expected observations and
        troubleshooting.
      </p>
      <div className="walkthrough-filters">
        <label>
          Search walkthroughs
          <input
            type="search"
            aria-label="Search walkthroughs"
            placeholder="Machine, technique or step…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Platform
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All platforms</option>
            {[...new Set(catalog.articles.map((a) => a.category))].map((c) => (
              <option key={c} value={c}>
                {categoryName(c)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Study track
          <select value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="">All study tracks</option>
            <option value="OSCP">OSCP</option>
            <option value="Red Teaming">Red Teaming</option>
          </select>
        </label>
      </div>
      <p>
        {articles.length} pages · From{" "}
        <a href={catalog.repository} target="_blank" rel="noopener noreferrer">
          Perryong/Writeups-and-Walkthroughs
        </a>
        , forked from{" "}
        <a
          href="https://github.com/dev-angelist/Writeups-and-Walkthroughs"
          target="_blank"
          rel="noopener noreferrer"
        >
          dev-angelist
        </a>
        , plus illustrated study guides referencing{" "}
        <a
          href="https://0xdf.gitlab.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          0xdf
        </a>
        .
      </p>
      <p className="muted">
        Reference material is separate from your private notes. Screenshots
        require an internet connection. Source steps may reflect older lab
        versions. Study-track labels follow the supplied LainKusanagi lists; Red
        Teaming extends beyond OSCP. New conceptual guides include explanations,
        learning maps, expected observations, troubleshooting and credited
        source images. They do not contain exploitation commands.
      </p>
      <div className="walkthrough-grid">
        {articles.map((a) => (
          <article className="walkthrough-card" key={a.id}>
            <small>
              {categoryName(a.category)}
              {a.tracks?.length ? " · " + a.tracks.join(" / ") : ""}
            </small>
            <h2>
              <Link to={"/walkthroughs/" + a.id}>{a.title}</Link>
            </h2>
            <p>{a.excerpt}</p>
            {a.author && (
              <small>
                {a.format} · Source: {a.author}
              </small>
            )}
          </article>
        ))}
      </div>
      {!articles.length && (
        <p>No walkthroughs match. Try another machine or technique.</p>
      )}
    </section>
  );
}
