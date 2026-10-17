import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import StudyPlan from "../reference/StudyPlan";
import topics from "./topics.json";
import { useGraph } from "./useGraph";
import { kindLabel, mapHref } from "./graph";
import "./oscp.css";
export default function LearningHome({ uid }: { uid?: string }) {
  const graph = useGraph(uid),
    [params] = useSearchParams(),
    [query, setQuery] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(params.has("week"));
  useEffect(() => {
    if (params.has("week")) setPracticeOpen(true);
  }, [params]);
  const results = query.trim()
    ? graph.nodes
        .filter(
          (n) =>
            n.href &&
            (n.title + " " + n.collection + " " + n.topicIds.join(" "))
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .slice(0, 12)
    : [];
  return (
    <section className="page oscp-page">
      <div className="oscp-heading">
        <div>
          <p className="eyebrow">OSCP / YOUR LEARNING HOME</p>
          <h1>Understand. Practise. Connect.</h1>
          <p className="subtitle">
            A clear route through your notes, references and lab practice.
          </p>
        </div>
        <Link className="oscp-link-button" to="/mindmap">
          Explore Mindmap ↗
        </Link>
      </div>
      <label>
        Search the OSCP library
        <input
          type="search"
          placeholder="Find a concept, note, machine or cheat sheet…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {query.trim() && (
        <div className="map-results">
          {results.map((n) => (
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
          {!results.length && (
            <p>No matching content. Try a topic or machine name.</p>
          )}
          <Link to="/mindmap">Browse the complete content index →</Link>
        </div>
      )}
      <div className="oscp-hero">
        <div>
          <p className="eyebrow">ONE CONCEPT AT A TIME</p>
          <h2>
            Know what you’re looking for.
            <br />
            Then choose the next step.
          </h2>
          <p>
            Start with a short explanation, read the original notes, and test
            your understanding in a lab. The Mindmap keeps the connections
            visible.
          </p>
          <Link className="oscp-link-button" to="/topics/foundations">
            Start with foundations →
          </Link>
        </div>
        <div className="oscp-hero-steps">
          <Link to="/topics">01 · Understand the concept</Link>
          <Link to="/knowledge-vault">02 · Read the full reference</Link>
          <Link to="/practice-tracks">03 · Follow a practice track</Link>
          <a href="#weekly-practice" onClick={() => setPracticeOpen(true)}>
            04 · Choose your weekly machine
          </a>
        </div>
      </div>
      <div className="section-title">
        <h2>Your learning path</h2>
        <Link to="/topics">Browse all concepts →</Link>
      </div>
      <p className="subtitle">
        Use this order when starting out, or jump to the concept you need today.
      </p>
      <div className="oscp-topic-grid">
        {topics.map((t, i) => (
          <article className="oscp-topic-card" key={t.id}>
            <span className="oscp-topic-number">
              {String(i + 1).padStart(2, "0")} / {t.stage.toUpperCase()}
            </span>
            <h2>
              <Link to={"/topics/" + t.id}>{t.title}</Link>
            </h2>
            <p>{t.summary}</p>
            <span className="oscp-source-count">
              {
                graph.nodes.filter(
                  (n) => n.kind !== "topic" && n.topicIds.includes(t.id),
                ).length
              }{" "}
              connected resources
            </span>
            <div className="row">
              <Link to={"/topics/" + t.id}>Learn concept →</Link>
              <Link to={mapHref("topic:" + t.id)}>View connections</Link>
            </div>
          </article>
        ))}
      </div>
      <h2 style={{ marginTop: 32 }}>Keep your references close</h2>
      <div className="oscp-shortcuts">
        <Link to="/knowledge-vault">
          Knowledge Vault<small>Full source notes and screenshots</small>
        </Link>
        <Link to="/cheat-sheet">
          Cheat sheets<small>Searchable commands by topic</small>
        </Link>
        <Link to="/walkthroughs">
          Walkthroughs<small>Compare explanations and evidence</small>
        </Link>
        <Link to="/notes">
          My notes<small>Record what you understand</small>
        </Link>
      </div>
      <details
        className="oscp-week-plan"
        id="weekly-practice"
        open={practiceOpen}
        onToggle={(e) => setPracticeOpen(e.currentTarget.open)}
      >
        <summary>Weekly practice plan</summary>
        <p className="subtitle">
          Your existing machine sequence and saved progress. Expand a machine to
          find its walkthrough.
        </p>
        <StudyPlan uid={uid} />
      </details>
    </section>
  );
}
