import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import topics from "./topics.json";
import { useGraph } from "./useGraph";
import { mapHref, kindLabel } from "./graph";
import "./oscp.css";
export default function Topics({ uid }: { uid?: string }) {
  const { topicId } = useParams(),
    graph = useGraph(uid),
    [query, setQuery] = useState(""),
    [kind, setKind] = useState(""),
    [limit, setLimit] = useState(24);
  const topic = topics.find((t) => t.id === topicId);
  const resources = topic
    ? graph.nodes.filter(
        (n) => n.kind !== "topic" && n.topicIds.includes(topic.id),
      )
    : [];
  const order = [
    "track",
    "note",
    "lesson",
    "reference",
    "cheatsheet",
    "walkthrough",
    "machine",
    "week",
  ];
  resources.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  const filtered = resources.filter(
    (n) =>
      (!kind || n.kind === kind) &&
      n.title.toLowerCase().includes(query.toLowerCase()),
  );
  if (topicId && !topic)
    return (
      <section className="page">
        <h1>Concept not found</h1>
        <Link to="/topics">Browse concepts</Link>
      </section>
    );
  return (
    <section className="page oscp-page">
      <div className="oscp-heading">
        <div>
          <p className="eyebrow">OSCP / UNDERSTAND THE CONCEPT</p>
          <h1>{topic?.title || "Explore the concepts"}</h1>
          <p className="subtitle">
            {topic?.summary ||
              "Plain-language explanations, useful questions and connected references."}
          </p>
        </div>
        <Link
          className="oscp-link-button"
          to={topic ? mapHref("topic:" + topic.id) : "/mindmap"}
        >
          See in Mindmap ↗
        </Link>
      </div>
      {!topic ? (
        <>
          <div className="oscp-topic-grid">
            {topics.map((t, i) => (
              <article className="oscp-topic-card" key={t.id}>
                <span className="oscp-topic-number">
                  {String(i + 1).padStart(2, "0")} / {t.stage}
                </span>
                <h2>
                  <Link to={"/topics/" + t.id}>{t.title}</Link>
                </h2>
                <p>{t.summary}</p>
                <Link to={"/topics/" + t.id}>Understand this topic →</Link>
              </article>
            ))}
          </div>
          <p>
            <Link to="/notes?view=tags">Browse my personal note tags →</Link>
          </p>
        </>
      ) : (
        <>
          <p>
            <Link to="/topics">← All concepts</Link>
          </p>
          <div className="oscp-reading">
            <article className="oscp-lesson">
              <h2>The idea in plain language</h2>
              <p>{topic.explanation}</p>
              <h2>What to look for</h2>
              <ul>
                {topic.observations.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <h2>Try this in your lab</h2>
              <p>{topic.exercise}</p>
              <h2>Common misunderstandings</h2>
              <ul>
                {topic.misconceptions.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <div className="oscp-check">
                <strong>Check your understanding</strong>
                <p>{topic.question}</p>
                <Link to="/notes">Write your explanation in a note →</Link>
              </div>
            </article>
            <aside className="oscp-sidecard">
              <h2>Learn this first</h2>
              {topic.prerequisites.length ? (
                topic.prerequisites.map((id) => (
                  <Link key={id} to={"/topics/" + id}>
                    {topics.find((t) => t.id === id)!.title} →
                  </Link>
                ))
              ) : (
                <p>This is the starting point. No earlier topic is required.</p>
              )}
              <h3>Connect your notes</h3>
              <p>
                Tag a personal note <code>{topic.id}</code> to connect it to
                this concept in the Mindmap.
              </p>
              <h3>Where to go next</h3>
              {topics
                .filter((t) => t.prerequisites.includes(topic.id))
                .map((t) => (
                  <Link key={t.id} to={"/topics/" + t.id}>
                    {t.title} →
                  </Link>
                ))}
              <Link to={mapHref("topic:" + topic.id)}>
                Explore all connections →
              </Link>
            </aside>
          </div>
          <section className="oscp-topic-resources">
            <h2>Read, reference & practise</h2>
            <p className="quiet">
              Practice tracks are curated for this concept. Other references are
              suggested from source metadata; tagged private notes are your own
              connections. Open each source for its full context.
            </p>
            <div className="oscp-search-row">
              <label>
                Search connected resources
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(24);
                  }}
                />
              </label>
              <label>
                Content type
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setLimit(24);
                  }}
                >
                  <option value="">All types</option>
                  {[...new Set(resources.map((n) => n.kind))].map((k) => (
                    <option key={k} value={k}>
                      {kindLabel[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>{filtered.length} connected resources</p>
            <div className="map-results">
              {filtered.slice(0, limit).map((n) => (
                <article key={n.id}>
                  <div>
                    <small>
                      {kindLabel[n.kind]} · {n.collection}
                    </small>
                    <h3>
                      <Link to={n.href}>{n.title}</Link>
                    </h3>
                  </div>
                  <Link to={mapHref(n.id)}>Map ↗</Link>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <p>
                No matching resources. Try another filter or explore the full
                map.
              </p>
            )}
            {filtered.length > limit && (
              <button onClick={() => setLimit((n) => n + 36)}>
                Show more resources
              </button>
            )}
          </section>
        </>
      )}
    </section>
  );
}
