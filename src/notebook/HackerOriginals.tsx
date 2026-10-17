import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type SourceNote = {
  id: string;
  path: string;
  title: string;
  category: string;
  group: string;
  imageCount: number;
  searchText: string;
};
type Catalog = {
  archiveSha256: string;
  imageCount: number;
  notes: SourceNote[];
};
type Article = {
  html: string;
  toc: { id: string; title: string; level: number }[];
};
const notePath = (id: string) => `/knowledge-vault/hacker-docs--source-${id}`;

export default function HackerOriginals({ id }: { id: string }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const selectedId = id.startsWith("hacker-docs--source-")
    ? id.slice("hacker-docs--source-".length)
    : "";
  const note = catalog?.notes.find((n) => n.id === selectedId);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setArticle(null);
    setStatus("");
    setImageError(false);
    setZoom(null);
    void (async () => {
      const response = await fetch("/hacker-docs/catalog.json", {
        signal: controller.signal,
      });
      if (!response.ok) throw Error("Could not load collection");
      const data: Catalog = await response.json();
      if (!Array.isArray(data.notes)) throw Error("Invalid collection");
      if (controller.signal.aborted) return;
      setCatalog(data);
      if (!data.notes.some((n) => n.id === selectedId)) return;
      const page = await fetch(`/hacker-docs/${selectedId}.json`, {
        signal: controller.signal,
      });
      if (!page.ok) throw Error("Could not load note");
      const content: Article = await page.json();
      if (typeof content.html !== "string" || !Array.isArray(content.toc))
        throw Error("Invalid note");
      if (!controller.signal.aborted) setArticle(content);
    })().catch(() => {
      if (!controller.signal.aborted)
        setError(
          "Unable to load the source notes. Check your connection and retry.",
        );
    });
    return () => controller.abort();
  }, [selectedId, attempt]);
  useEffect(() => {
    if (article && window.location.hash)
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [selectedId, article]);
  useEffect(() => {
    if (zoom) dialog.current?.showModal();
  }, [zoom]);
  const matches =
    catalog?.notes.filter(
      (n) =>
        (!topic || n.group === topic) &&
        `${n.title} ${n.category} ${n.searchText}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    ) ?? [];
  const groups = [...new Set(matches.map((n) => n.group))];
  const index = catalog?.notes.findIndex((n) => n.id === selectedId) ?? -1;
  return (
    <section className="page walkthrough-reader">
      <Link to="/knowledge-vault">← Knowledge Vault</Link>
      <p className="eyebrow">OSCP / HACKER-DOCS / ORIGINAL SOURCE NOTES</p>
      {!selectedId ? (
        <>
          <h1>Hacker-DOCS study collection</h1>
          <p>
            Full notes from your supplied archive: explanations, commands, lab
            examples, tables and screenshots, organised by the original topics.
          </p>
          <p className="quiet">
            Author: ghostware0x00 · Fork:{" "}
            <a
              href="https://github.com/Perryong/Hacker-DOCS"
              target="_blank"
              rel="noopener noreferrer"
            >
              Perryong/Hacker-DOCS
            </a>{" "}
            ·{" "}
            <Link to="/knowledge-vault/hacker-docs--study-guides">
              12 introductory study guides
            </Link>
          </p>
          {catalog && (
            <>
              <p>
                {catalog.notes.length} full note pages · {catalog.imageCount}{" "}
                supplied images
              </p>
              <div className="row">
                <input
                  type="search"
                  aria-label="Search original Hacker-DOCS notes"
                  placeholder="Search full notes, commands or topics…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <label>
                  Topic{" "}
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="">All topics</option>
                    {[...new Set(catalog.notes.map((n) => n.group))].map(
                      (group) => (
                        <option key={group}>{group}</option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <p role="status">
                {matches.length} of {catalog.notes.length} notes
              </p>
              {groups.map((group) => (
                <div key={group}>
                  <h2>{group}</h2>
                  <div className="osai-grid">
                    {matches
                      .filter((n) => n.group === group)
                      .map((n) => (
                        <article className="week-card" key={n.id}>
                          <div>
                            <p className="eyebrow">{n.category}</p>
                            <h3>
                              <Link to={notePath(n.id)}>{n.title}</Link>
                            </h3>
                            <p>{n.imageCount} screenshots · Full source note</p>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              ))}
              {!matches.length && <p>No notes match these filters.</p>}
              <p className="quiet">
                Imported from the supplied ZIP · Archive SHA-256:{" "}
                {catalog.archiveSha256.slice(0, 16)} ·{" "}
                <a href="/hacker-docs/README.md" download>
                  Repository README
                </a>
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <Link to="/knowledge-vault/hacker-docs">← All source notes</Link>
          {catalog && !note && !error && <h1>Source note not found.</h1>}
          {note && (
            <>
              <p className="eyebrow">
                {note.category} / {note.group}
              </p>
              <h1>{note.title}</h1>
              <p>
                Original notes by ghostware0x00 · Imported from your supplied
                Hacker-DOCS ZIP. Source text is preserved; examples have not
                been re-tested.
              </p>
              <div className="row">
                <a href={`/hacker-docs/${note.id}.md`} download>
                  Download original Markdown
                </a>
                <a
                  href={`https://github.com/Perryong/Hacker-DOCS/blob/main/${note.path.split("/").map(encodeURIComponent).join("/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View source file on GitHub
                </a>
              </div>
              {article && (
                <>
                  <nav
                    aria-label="Source note contents"
                    className="walkthrough-toc"
                  >
                    <details open>
                      <summary>
                        On this page · {article.toc.length} sections
                      </summary>
                      <ol>
                        {article.toc.map((h) => (
                          <li key={h.id}>
                            <a href={`#${h.id}`}>{h.title}</a>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </nav>
                  <p role="status">{status}</p>
                  {imageError && (
                    <p role="alert">
                      A screenshot could not load. Reconnect and reload this
                      note.
                    </p>
                  )}
                  <article
                    className="walkthrough-body"
                    onError={(e) => {
                      if (e.target instanceof HTMLImageElement)
                        setImageError(true);
                    }}
                    onClick={async (e) => {
                      const target = e.target as HTMLElement;
                      const copy = target.closest(".copy-command");
                      if (copy) {
                        try {
                          await navigator.clipboard.writeText(
                            copy.parentElement?.querySelector("pre")
                              ?.textContent || "",
                          );
                          setStatus("Copied code");
                        } catch {
                          setStatus("Select and copy the code text.");
                        }
                        return;
                      }
                      const image = target
                        .closest(".image-expand")
                        ?.querySelector("img");
                      if (image) {
                        setZoom({ src: image.src, alt: image.alt });
                        return;
                      }
                      const href = target.closest("a")?.getAttribute("href");
                      if (
                        href?.startsWith("/knowledge-vault/") &&
                        !e.ctrlKey &&
                        !e.metaKey &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        navigate(href);
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: article.html }}
                  />
                  <nav className="row" aria-label="Source note navigation">
                    {index > 0 && (
                      <Link to={notePath(catalog!.notes[index - 1].id)}>
                        ← Previous note
                      </Link>
                    )}
                    {index < catalog!.notes.length - 1 && (
                      <Link to={notePath(catalog!.notes[index + 1].id)}>
                        Next note →
                      </Link>
                    )}
                  </nav>
                </>
              )}
            </>
          )}
        </>
      )}
      {!error && (!catalog || (note && !article)) && (
        <p role="status">Loading source notes…</p>
      )}
      {error && (
        <p role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((n) => n + 1)}>Retry</button>
        </p>
      )}
      {zoom && (
        <dialog
          ref={dialog}
          className="screenshot-dialog"
          aria-label="Screenshot"
          onClose={() => setZoom(null)}
        >
          <button autoFocus onClick={() => dialog.current?.close()}>
            Close screenshot
          </button>
          <a href={zoom.src} target="_blank" rel="noopener noreferrer">
            Open full image
          </a>
          <img src={zoom.src} alt={zoom.alt} />
        </dialog>
      )}
    </section>
  );
}
