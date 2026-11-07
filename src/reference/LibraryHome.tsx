import { Link } from "react-router-dom";
import type { WorkspaceId } from "../workspaces/model";
export default function LibraryHome({ workspace }: { workspace: WorkspaceId }) {
  const resources =
    workspace === "oscp"
      ? [
          [
            "/topics",
            "Concepts",
            "Learn a technique and connect it to your practice.",
          ],
          [
            "/knowledge-vault",
            "Knowledge Vault",
            "Source collections and your private topic notes.",
          ],
          [
            "/cheat-sheet",
            "Cheat sheets",
            "Find commands and quick reference material.",
          ],
          [
            "/walkthroughs",
            "Walkthroughs",
            "Search machine writeups and illustrated study guides.",
          ],
          [
            "/mindmap",
            "Mindmap",
            "Explore connections between topics, notes and labs.",
          ],
          [
            "/practice-tracks",
            "Practice tracks",
            "Choose a sequence of focused lab exercises.",
          ],
        ]
      : [
          [
            "/osai/library/osai-vault",
            "OSAI Vault",
            "Read the full 23-module study collection.",
          ],
          [
            "/osai/library/owasp-resources",
            "OWASP Resources",
            "Browse AI security references and project resources.",
          ],
          [
            "/osai/library",
            "Learning library",
            "Find lessons, lab templates and exam preparation.",
          ],
          [
            "/osai/topics",
            "My topic notes",
            "Browse the private notes you have organised by tag.",
          ],
        ];
  return (
    <section className="page">
      <p className="eyebrow">
        {workspace.toUpperCase()} / REFERENCE COLLECTIONS
      </p>
      <h1>Library</h1>
      <p className="subtitle">
        Choose a collection, then search or browse its resources.
      </p>
      <div className="library-collections">
        {resources.map(([to, title, description]) => (
          <article key={to}>
            <h2>
              <Link to={to}>{title}</Link>
            </h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
