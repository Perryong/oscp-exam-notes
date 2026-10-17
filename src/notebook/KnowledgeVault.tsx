import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EditorContent, useEditor, ReactNodeViewRenderer } from "@tiptap/react";
import { useNotebook } from "./NotebookContext";
import { vaultNotes } from "./vault";
import StarterKit from "@tiptap/starter-kit";
import {
  decodeEditor,
  extensions,
  Screenshot,
  safeLink,
} from "../editor/schema";
import ScreenshotNode, { ImageLoader } from "../editor/ScreenshotNode";
import { loadImage } from "../firebase/images";
import type { NoteContent } from "./model";
import HackerDocs from "./HackerDocs";
function ReadingBody({ content, uid }: { content: NoteContent; uid: string }) {
  const decoded = useMemo(() => {
    try {
      return { doc: decodeEditor(content.contentJson), error: false };
    } catch {
      return { doc: undefined, error: true };
    }
  }, [content.contentJson]);
  const editor = useEditor(
    {
      extensions: extensions.map((e) =>
        e.name === "starterKit"
          ? StarterKit.configure({
              link: {
                openOnClick: true,
                protocols: ["http", "https"],
                isAllowedUri: safeLink,
              },
            })
          : e.name === "screenshot"
            ? Screenshot.extend({
                addNodeView() {
                  return ReactNodeViewRenderer(ScreenshotNode);
                },
              })
            : e,
      ),
      content: decoded.doc,
      editable: false,
      editorProps: { attributes: { "aria-label": "Topic reading content" } },
    },
    [content.contentJson],
  );
  const loader = useMemo(() => (id: string) => loadImage(uid, id), [uid]);
  return decoded.error ? (
    <p role="alert">
      This note cannot be displayed. Open Edit note to inspect it.
    </p>
  ) : (
    <ImageLoader.Provider value={loader}>
      <EditorContent editor={editor} />
    </ImageLoader.Provider>
  );
}
export default function KnowledgeVault({ uid }: { uid?: string }) {
  const { id } = useParams();
  const { notes } = useNotebook();
  const topics = uid ? vaultNotes(notes) : [];
  const [query, setQuery] = useState("");
  const selected = topics.find((n) => n.id === id);
  const index = topics.findIndex((n) => n.id === id);
  const matches = topics.filter((n) =>
    (n.content.title + " " + n.content.text)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (id === "hacker-docs" || id?.startsWith("hacker-docs--")) {
    return <HackerDocs key={id} id={id} uid={uid} />;
  }
  return (
    <section className="page">
      <p className="eyebrow">OSCP / KNOWLEDGE LIBRARY</p>
      <h1>OSCP Knowledge Vault</h1>
      <p>Your topic notes, images and sources in study order.</p>
      <article className="week-card">
        <div>
          <p className="eyebrow">NEW · 12 ORDERED LESSONS</p>
          <h2>
            <Link to="/knowledge-vault/hacker-docs">
              Hacker-DOCS study collection
            </Link>
          </h2>
          <p>
            Network and web foundations with explanations, diagrams, examples
            and troubleshooting. Copy a lesson into your private notes to add
            your own evidence.
          </p>
        </div>
      </article>
      {!uid && (
        <p>
          <Link to="/settings">
            Sign in to read and edit your private notes
          </Link>
        </p>
      )}
      <input
        aria-label="Search knowledge vault"
        placeholder="Search topics or commands…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="knowledge-layout">
        <nav className="lesson-toc" aria-label="Vault topics">
          <Link to="/knowledge-vault">All topics</Link>
          {matches.map((n) => (
            <Link
              key={n.id}
              aria-current={n.id === id ? "page" : undefined}
              to={"/knowledge-vault/" + n.id}
            >
              {n.content.title.replace(/^Discord resources\s*·\s*/, "")}
            </Link>
          ))}
        </nav>
        <div>
          {!id && (
            <>
              <p>{topics.length} topics · Private to your account</p>
              <div className="osai-grid">
                {matches.map((n) => (
                  <article className="week-card" key={n.id}>
                    <div>
                      <h2>
                        <Link to={"/knowledge-vault/" + n.id}>
                          {n.content.title.replace(
                            /^Discord resources\s*·\s*/,
                            "",
                          )}
                        </Link>
                      </h2>
                      <p>
                        {n.content.attachmentIds.length} images ·{" "}
                        {n.content.tags
                          .filter((t) => t !== "discord-resources")
                          .join(", ")}
                      </p>
                      <Link to={"/knowledge-vault/" + n.id}>Read topic →</Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {id && !selected && (
            <p>This topic is unavailable, in Trash, or has not synced yet.</p>
          )}
          {selected && uid && (
            <>
              <h2>
                {selected.content.title.replace(
                  /^Discord resources\s*·\s*/,
                  "",
                )}
              </h2>
              <div className="row">
                <Link to={"/notes/" + selected.id}>Edit note</Link>
                <Link to="/knowledge-vault">Back to topics</Link>
              </div>
              <div className="walkthrough-body vault-body">
                <ReadingBody
                  key={uid + selected.id}
                  uid={uid}
                  content={selected.content}
                />
              </div>
              <nav className="row" aria-label="Topic navigation">
                {index > 0 && (
                  <Link to={"/knowledge-vault/" + topics[index - 1].id}>
                    ← Previous topic
                  </Link>
                )}
                {index < topics.length - 1 && (
                  <Link to={"/knowledge-vault/" + topics[index + 1].id}>
                    Next topic →
                  </Link>
                )}
              </nav>
            </>
          )}
          {!matches.length && (
            <p>
              {topics.length
                ? "No matching topics. Try another search."
                : "Your private topic notes appear here after sign-in and sync. Copy a study lesson or tag a note knowledge-vault to include it."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
