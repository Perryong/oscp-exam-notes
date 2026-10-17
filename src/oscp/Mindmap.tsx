import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { connections, kindLabel } from "./graph";
import { useGraph } from "./useGraph";
import GraphCanvas from "./GraphCanvas";
import topics from "./topics.json";
import "./oscp.css";
export default function Mindmap({ uid }: { uid?: string }) {
  const graph = useGraph(uid),
    [params, setParams] = useSearchParams();
  const requested = params.get("node") || "oscp";
  const selected =
    graph.nodes.find((n) => n.id === requested) || graph.nodes[0];
  const full = params.get("view") === "all";
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState(""),
    [limit, setLimit] = useState(30);
  const related = useMemo(
    () => connections(graph, selected.id),
    [graph, selected.id],
  );
  const topic = topics.find((t) => "topic:" + t.id === selected.id);
  const localIds = new Set(related.map((r) => r.node.id));
  const contentNeighbors = graph.nodes.filter(
    (n) =>
      localIds.has(n.id) && !["root", "topic", "collection"].includes(n.kind),
  );
  const sample = [
    "note",
    "lesson",
    "reference",
    "cheatsheet",
    "walkthrough",
    "machine",
    "week",
  ].flatMap((kind) =>
    contentNeighbors.filter((n) => n.kind === kind).slice(0, 3),
  );
  const sampledIds = new Set(sample.map((n) => n.id));
  const visibleContent = [
    ...sample,
    ...contentNeighbors.filter((n) => !sampledIds.has(n.id)),
  ].slice(0, 24);
  const focusNodes =
    selected.id === "oscp"
      ? graph.nodes.filter((n) => n.id === "oscp" || n.kind === "topic")
      : [
          selected,
          ...graph.nodes.filter(
            (n) =>
              localIds.has(n.id) &&
              (n.kind === "topic" ||
                n.kind === "root" ||
                n.kind === "collection"),
          ),
          ...visibleContent,
        ];
  const visibleIds = new Set(focusNodes.map((n) => n.id));
  const canvas = full
    ? graph
    : {
        nodes: focusNodes,
        edges: graph.edges.filter(
          (e) => visibleIds.has(e.from) && visibleIds.has(e.to),
        ),
      };
  const searchable = graph.nodes.filter(
    (n) => n.kind !== "root" && n.kind !== "collection",
  );
  const results = searchable.filter(
    (n) =>
      (!kind || n.kind === kind) &&
      (!query
        ? selected.id === "oscp" || localIds.has(n.id) || n.id === selected.id
        : (n.title + " " + n.collection + " " + n.topicIds.join(" "))
            .toLowerCase()
            .includes(query.toLowerCase())),
  );
  const choose = (id: string) => {
    setParams((p) => {
      p.set("node", id);
      return p;
    });
    setLimit(30);
  };
  return (
    <section className="page oscp-page mindmap-page">
      <div className="oscp-heading">
        <div>
          <p className="eyebrow">SEE HOW THE IDEAS CONNECT</p>
          <h1>Mindmap</h1>
          <p className="subtitle">
            Start with a concept. Follow its connections. Open the full notes.
          </p>
        </div>
        <Link className="oscp-link-button" to="/study-plan">
          Learning home →
        </Link>
      </div>
      <div className="map-view-controls">
        <div className="tabs" role="group" aria-label="Map mode">
          <button
            aria-pressed={!full}
            className={!full ? "selected" : ""}
            onClick={() =>
              setParams((p) => {
                p.delete("view");
                return p;
              })
            }
          >
            Guided map
          </button>
          <button
            aria-pressed={full}
            className={full ? "selected" : ""}
            onClick={() =>
              setParams((p) => {
                p.set("view", "all");
                return p;
              })
            }
          >
            Full graph
          </button>
        </div>
        <button
          className="quiet"
          onClick={() => {
            choose("oscp");
            setQuery("");
            setKind("");
          }}
        >
          All concepts
        </button>
        <span>
          {
            graph.nodes.filter(
              (n) => !["root", "topic", "collection"].includes(n.kind),
            ).length
          }{" "}
          connected items
        </span>
      </div>
      {requested !== selected.id && (
        <p role="status">
          This item is unavailable. It may require sign-in or have been deleted.
          Showing all concepts.
        </p>
      )}
      <div className="mindmap-layout">
        <div>
          <GraphCanvas
            key={full ? "full" : selected.id}
            graph={canvas}
            selected={selected.id}
            full={full}
            onSelect={choose}
            highlight={
              query || kind ? new Set(results.map((n) => n.id)) : undefined
            }
          />
          <div className="map-legend">
            <span>● Concepts</span>
            <span>● Source notes & lessons</span>
            <span>● Cheat sheets</span>
            <span>● Walkthroughs</span>
            <span>● Practice & private notes</span>
          </div>
          <p className="quiet">
            {!full && selected.id !== "oscp"
              ? "Focused view shows up to 24 content nodes. All connected items are available in the list below. "
              : ""}
            Dotted connections suggest a topic from source metadata. They do not
            verify a machine solution.
          </p>
        </div>
        <aside className="map-details" aria-label="Selected item">
          <p className="eyebrow">{kindLabel[selected.kind]}</p>
          <h2>{selected.title}</h2>
          <p>
            {selected.description ||
              `From ${selected.collection}. Open the original content to read its full explanation and evidence.`}
          </p>
          {selected.href && (
            <Link className="oscp-link-button primary" to={selected.href}>
              Open {selected.title}
            </Link>
          )}
          {topic && (
            <>
              <h3>Understand this first</h3>
              <p>{topic.explanation}</p>
              <h3>Check your understanding</h3>
              <p>{topic.question}</p>
            </>
          )}
          <h3>Connections & backlinks</h3>
          <p className="quiet">{related.length} relationships</p>
          <div className="map-connections">
            {related.slice(0, 40).map((r, i) => (
              <button
                key={r.node.id + r.label + i}
                onClick={() => choose(r.node.id)}
              >
                <small>
                  {r.incoming ? "←" : "→"} {r.label}
                </small>
                {r.node.title}
              </button>
            ))}
          </div>
          {related.length > 40 && (
            <p className="quiet">
              Use the connected content list for the remaining items.
            </p>
          )}
        </aside>
      </div>
      <section className="map-browser">
        <div className="section-title">
          <h2>
            {query
              ? "Search results"
              : selected.id === "oscp"
                ? "Explore all content"
                : "Connected content"}
          </h2>
          <span>{results.length} items</span>
        </div>
        <div className="oscp-search-row">
          <label>
            Find content
            <input
              type="search"
              placeholder="Search titles, collections or topics…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(30);
              }}
            />
          </label>
          <label>
            Content type
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setLimit(30);
              }}
            >
              <option value="">All types</option>
              {[...new Set(searchable.map((n) => n.kind))].map((k) => (
                <option key={k} value={k}>
                  {kindLabel[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="map-results">
          {results.slice(0, limit).map((n) => (
            <article key={n.id}>
              <div>
                <small>
                  {kindLabel[n.kind]} · {n.collection || "Learning path"}
                </small>
                <button
                  onClick={() => choose(n.id)}
                  aria-label={"Select " + n.title}
                >
                  {n.title}
                </button>
              </div>
              <Link to={n.href} aria-label={"Read " + n.title}>
                Read →
              </Link>
            </article>
          ))}
        </div>
        {!results.length && <p>No content matches these filters.</p>}
        {results.length > limit && (
          <button onClick={() => setLimit((n) => n + 60)}>
            Show more content ({results.length - limit} remaining)
          </button>
        )}
        {!uid && (
          <p className="quiet">
            <Link to="/settings">Sign in</Link> to connect your private notes.
            Your tags and explicit note links create personal connections.
          </p>
        )}
      </section>
    </section>
  );
}
