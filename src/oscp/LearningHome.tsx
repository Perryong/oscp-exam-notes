import StudyActions from "./StudyActions";
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
          <h1>Today</h1>
          <p className="subtitle">
            A clear route through your notes, references and lab practice.
          </p>
        </div>
      </div>
      <StudyActions uid={uid} workspace="oscp" />
      <article className="week-card">
        <h2>HTB Academy · 10 hours each week</h2>
        <p>
          Follow your 51-week path, track module completion and open weekly
          reflection notes.
        </p>
        <div className="row">
          <Link to="/calendar">Open HTB calendar →</Link>
          <Link to="/htb-study">Full HTB schedule</Link>
          <a href="/getting-started.html">Getting Started guide</a>
          <a href="/nmap-study-guide.html">Nmap study guide</a>
        </div>
      </article>
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
    </section>
  );
}
