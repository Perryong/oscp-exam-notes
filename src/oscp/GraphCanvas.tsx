import { useMemo, useRef, useState } from "react";
import type { Graph, GraphNode } from "./graph";
const colors: Record<string, string> = {
  root: "#faf3da",
  topic: "#79d7bc",
  collection: "#b2c2de",
  reference: "#6cbad0",
  lesson: "#83cfa6",
  cheatsheet: "#e8c27a",
  walkthrough: "#b39cde",
  machine: "#d996aa",
  week: "#afba8b",
  note: "#f4b76c",
};
export default function GraphCanvas({
  graph,
  selected,
  full,
  onSelect,
  highlight,
}: {
  graph: Graph;
  selected: string;
  full: boolean;
  onSelect: (id: string) => void;
  highlight?: Set<string>;
}) {
  const [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const svg = useRef<SVGSVGElement>(null);
  const points = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!full) {
      map.set(selected, { x: 600, y: 360 });
      const rest = graph.nodes.filter((n) => n.id !== selected);
      rest.forEach((n, i) => {
        const angle = (i / rest.length) * Math.PI * 2 - Math.PI / 2;
        const ring = rest.length > 18 && i % 2 ? 220 : 290;
        map.set(n.id, {
          x: 600 + Math.cos(angle) * ring * 1.6,
          y: 360 + Math.sin(angle) * ring,
        });
      });
    } else {
      map.set("oscp", { x: 600, y: 360 });
      const topics = graph.nodes.filter((n) => n.kind === "topic"),
        groups = graph.nodes.filter((n) => n.kind === "collection");
      topics.forEach((n, i) => {
        const a = (i / topics.length) * Math.PI * 2;
        map.set(n.id, {
          x: 600 + Math.cos(a) * 145,
          y: 360 + Math.sin(a) * 105,
        });
      });
      groups.forEach((g, i) => {
        const a = (i / groups.length) * Math.PI * 2;
        const center = {
          x: 600 + Math.cos(a) * 400,
          y: 360 + Math.sin(a) * 240,
        };
        map.set(g.id, center);
        const members = graph.nodes.filter(
          (n) => n.collection === g.collection && n.kind !== "collection",
        );
        members.forEach((n, j) => {
          const a = j * 2.399963;
          const r = 12 + Math.sqrt((j + 1) / members.length) * 100;
          map.set(n.id, {
            x: center.x + Math.cos(a) * r,
            y: center.y + Math.sin(a) * r,
          });
        });
      });
    }
    return map;
  }, [graph, selected, full]);
  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }
  const setScale = (value: number) =>
    setZoom(Math.max(0.5, Math.min(4, value)));
  const selectedNeighbors = new Set(
    graph.edges
      .filter((e) => e.from === selected || e.to === selected)
      .flatMap((e) => [e.from, e.to]),
  );
  const short = (n: GraphNode) =>
    n.title.length > 28 ? n.title.slice(0, 26) + "…" : n.title;
  return (
    <div className="map-canvas-wrap">
      <div className="map-tools" role="group" aria-label="Map controls">
        <button onClick={() => setScale(zoom + 0.25)} aria-label="Zoom in">
          ＋
        </button>
        <button onClick={() => setScale(zoom - 0.25)} aria-label="Zoom out">
          −
        </button>
        <button onClick={reset}>Reset view</button>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
      <svg
        ref={svg}
        className="map-canvas"
        viewBox="0 0 1200 740"
        role="group"
        aria-label={
          full ? "Full OSCP knowledge graph" : "Guided OSCP topic map"
        }
        onPointerDown={(e) => {
          if ((e.target as Element).closest("[data-node]")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const bounds = e.currentTarget.getBoundingClientRect();
          const scale = Math.min(bounds.width / 1200, bounds.height / 740);
          setPan({
            x: drag.current.px + (e.clientX - drag.current.x) / scale,
            y: drag.current.py + (e.clientY - drag.current.y) / scale,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern
            id="map-dots"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#2b4247" />
          </pattern>
        </defs>
        <rect width="1200" height="740" fill="url(#map-dots)" />
        <g
          transform={`translate(${600 + pan.x} ${370 + pan.y}) scale(${zoom}) translate(-600 -370)`}
        >
          {graph.edges.map((e, i) => {
            const a = points.get(e.from),
              b = points.get(e.to);
            return a && b ? (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={
                  e.from === selected || e.to === selected
                    ? "#91bcb3"
                    : "#395359"
                }
                strokeWidth={full ? 0.7 : 1.3}
                opacity={
                  full && e.from !== selected && e.to !== selected ? 0.28 : 0.65
                }
                strokeDasharray={
                  e.label === "Suggested topic" ? "4 5" : undefined
                }
              />
            ) : null;
          })}
          {graph.nodes.map((n) => {
            const p = points.get(n.id);
            if (!p) return null;
            const core = ["topic", "root", "collection"].includes(n.kind),
              isSelected = n.id === selected;
            const label =
              !full ||
              n.kind === "root" ||
              n.kind === "collection" ||
              isSelected;
            return (
              <g
                key={n.id}
                data-node={n.id}
                transform={`translate(${p.x},${p.y})`}
                role="button"
                tabIndex={full && !core && !isSelected ? -1 : 0}
                aria-label={`Focus ${n.title}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(n.id);
                  }
                }}
                className="graph-node"
                opacity={
                  highlight && !highlight.has(n.id) && !core && !isSelected
                    ? 0.22
                    : 1
                }
              >
                <title>{n.title}</title>
                {isSelected && (
                  <circle
                    r={core ? 32 : full ? 13 : 24}
                    fill="none"
                    stroke="#faf3da"
                    strokeWidth="2"
                  />
                )}
                <circle
                  r={core ? (n.kind === "root" ? 23 : 17) : full ? 4.5 : 10}
                  fill={colors[n.kind] || "#b2c2de"}
                  stroke={selectedNeighbors.has(n.id) ? "#e9f8f2" : "#173239"}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {label && (
                  <text
                    y={core ? 45 : full ? 23 : 29}
                    textAnchor="middle"
                    fill={isSelected ? "#ffffff" : "#d2e0df"}
                    fontSize={full ? 15 : core ? 19 : 16}
                    fontWeight={core ? 650 : 400}
                  >
                    {short(n)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <p className="map-hint">
        Select a node to explore. Drag the background to pan. Use the content
        list for keyboard navigation.
      </p>
    </div>
  );
}
