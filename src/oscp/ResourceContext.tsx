import { Link, useLocation } from "react-router-dom";
import { useGraph } from "./useGraph";
import { mapHref, resourceAt } from "./graph";
import topics from "./topics.json";
import "./oscp.css";
export default function ResourceContext({ uid }: { uid?: string }) {
  const location = useLocation(),
    graph = useGraph(uid);
  if (
    location.pathname.startsWith("/osai") ||
    location.pathname === "/settings" ||
    location.pathname === "/mindmap" ||
    location.pathname.startsWith("/topics") ||
    location.pathname === "/study-plan"
  )
    return null;
  const resource =
    resourceAt(graph, location.pathname + location.search + location.hash) ||
    resourceAt(graph, location.pathname + location.search) ||
    resourceAt(graph, location.pathname);
  return (
    <div className="resource-context" aria-label="Learning connections">
      <Link to="/topics">Understand the concepts</Link>
      <Link to={resource ? mapHref(resource.id) : "/mindmap"}>
        {resource ? "View connections & backlinks" : "Explore Mindmap"} ↗
      </Link>
      {resource?.topicIds.slice(0, 3).map((id) => (
        <Link key={id} to={"/topics/" + id}>
          {topics.find((t) => t.id === id)?.title}
        </Link>
      ))}
    </div>
  );
}
