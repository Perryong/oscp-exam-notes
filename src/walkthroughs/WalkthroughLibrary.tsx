import { useState } from "react";
import { Link } from "react-router-dom";
import { catalog, categoryName } from "./catalog";
export default function WalkthroughLibrary() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("");
  const articles = catalog.articles.filter(
    (a) =>
      (!category || a.category === category) &&
      `${a.title} ${categoryName(a.category)} ${a.searchText} ${a.excerpt}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="page walkthrough-library">
      <div className="eyebrow">READ. PRACTISE. TAKE NOTES.</div>
      <h1>Written walkthroughs</h1>
      <p className="subtitle">
        Step-by-step lab references with original commands, screenshots and
        explanations.
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
        .
      </p>
      <p className="muted">
        Reference material is separate from your private notes. Screenshots
        require an internet connection. Source steps may reflect older lab
        versions.
      </p>
      <div className="walkthrough-grid">
        {articles.map((a) => (
          <article className="walkthrough-card" key={a.id}>
            <small>{categoryName(a.category)}</small>
            <h2>
              <Link to={"/walkthroughs/" + a.id}>{a.title}</Link>
            </h2>
            <p>{a.excerpt}</p>
          </article>
        ))}
      </div>
      {!articles.length && (
        <p>No walkthroughs match. Try another machine or technique.</p>
      )}
    </section>
  );
}
