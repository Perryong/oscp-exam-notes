import { useNavigate } from "react-router-dom";
import { createNote } from "../notebook/repository";
import { encodeEditor } from "../editor/schema";
import { createOsaiLabTemplate } from "./templates";
import { isOsaiSeedId } from "./seeds";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { loadOsaiArticle, type OsaiArticle } from "./catalog";
export default function Reader({ uid }: { uid?: string }) {
  const navigate = useNavigate();
  const { slug = "" } = useParams(),
    [article, setArticle] = useState<OsaiArticle | null>(null),
    [error, setError] = useState(""),
    [status, setStatus] = useState("");
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    setArticle(null);
    setError("");
    void loadOsaiArticle(slug)
      .then((a) => {
        if (alive) {
          setArticle(a);
          if (!a) setError("Resource not found.");
        }
      })
      .catch(
        () =>
          alive &&
          setError("Unable to load this resource. Reconnect and reload."),
      );
    return () => {
      alive = false;
    };
  }, [slug]);
  useEffect(() => {
    if (!article || !location.hash) return;
    const target = [...(body.current?.querySelectorAll("[id]") ?? [])].find(
      (element) => element.id === location.hash.slice(1),
    );
    target?.scrollIntoView();
  }, [article]);
  async function makeNote(bookmark = false) {
    if (!uid) {
      navigate("/settings");
      return;
    }
    if (!article) return;
    try {
      const source = {
        title: article.title,
        url: location.origin + "/osai/library/" + slug,
      };
      const target = isOsaiSeedId("osai-module-" + slug)
        ? "osai-module-" + slug
        : "osai-module-assessment";
      const id = await createNote(uid, target, "osai", {
        title: (bookmark ? "Bookmark: " : "Lab: ") + article.title,
        ...encodeEditor(createOsaiLabTemplate(source)),
        tags: bookmark ? ["bookmark", ...article.owasp] : article.owasp,
      });
      navigate("/osai/notes/" + id);
    } catch (e) {
      setStatus(String(e));
    }
  }
  const headings = article
    ? (article.contents ??
      [...article.html.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(
        (m) => ({ id: m[1], title: m[2] }),
      ))
    : [];
  return (
    <section className="page osai-reader">
      <Link to="/osai/library">← Learning library</Link>
      {error && <p role="alert">{error}</p>}
      {!article && !error && <p>Loading resource…</p>}
      {article && (
        <>
          <p className="eyebrow">OSAI / {article.group}</p>
          <h1>{article.title}</h1>
          <p className="lead">{article.summary}</p>
          <p className="quiet">
            {article.attribution ??
              `Original Fieldnotes guide · Sources checked ${article.checkedAt}`}
          </p>
          <nav aria-label="Lesson contents" className="lesson-toc">
            {headings.map((h) => (
              <a href={"#" + h.id} key={h.id}>
                {h.title}
              </a>
            ))}
          </nav>
          <div className="reference-actions row">
            <button onClick={() => void makeNote()}>Create lab note</button>
            <button onClick={() => void makeNote(true)}>Bookmark lesson</button>
          </div>
          <button
            onClick={() => {
              const text = [...body.current!.querySelectorAll("pre")]
                .map((p) => p.textContent)
                .join("\n");
              void navigator.clipboard
                .writeText(text)
                .then(() => setStatus("Worksheet copied"))
                .catch(() => setStatus("Select and copy the worksheet text."));
            }}
          >
            Copy worksheet
          </button>
          <p role="status">{status}</p>
          <div
            ref={body}
            className="walkthrough-body osai-body"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
          <h2>Sources and further reading</h2>
          <ul>
            {article.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>{" "}
                <span className="quiet">({s.kind})</span>
              </li>
            ))}
          </ul>
          <p className="quiet">
            Community readings are references, not verified exam requirements.
            Record your own observations in a private lab note.
          </p>
        </>
      )}
    </section>
  );
}
