import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { catalog, categoryName } from "./catalog";
type Article = {
  html: string;
  toc: { id: string; title: string; level: number }[];
};
export default function WalkthroughReader() {
  const { id } = useParams(),
    entry = catalog.articles.find((a) => a.id === id),
    navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [status, setStatus] = useState(""),
    [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null),
    [imageError, setImageError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!entry) return;
    const controller = new AbortController();
    setArticle(null);
    setError("");
    setImageError(false);
    void fetch("/walkthroughs/" + entry.id + ".json", {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error("Article could not be loaded");
        return r.json();
      })
      .then((data) => {
        if (typeof data.html !== "string" || !Array.isArray(data.toc))
          throw Error("Invalid article");
        setArticle(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            "Unable to load this walkthrough. Reconnect and retry, or open the original source.",
          );
      });
    return () => controller.abort();
  }, [entry, attempt]);
  useEffect(() => {
    if (zoom) dialog.current?.showModal();
  }, [zoom]);
  useEffect(() => {
    if (article && location.hash) {
      const target = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
      target?.scrollIntoView();
    }
  }, [article]);
  if (!entry)
    return (
      <section className="page">
        <h1>Walkthrough not found</h1>
        <Link to="/walkthroughs">Back to walkthroughs</Link>
      </section>
    );
  return (
    <section className="page walkthrough-reader">
      <Link to="/walkthroughs">← All walkthroughs</Link>
      <div className="eyebrow">{categoryName(entry.category)}</div>
      <p className="walkthrough-source">
        <a href={entry.source} target="_blank" rel="noopener noreferrer">
          View original on GitHub
        </a>{" "}
        · Source: dev-angelist / Perryong · Snapshot{" "}
        {catalog.revision.slice(0, 7)}
      </p>
      {!article && !error && <p role="status">Loading walkthrough…</p>}
      {error && (
        <div role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((n) => n + 1)}>Retry</button>
        </div>
      )}
      {article && (
        <>
          <nav aria-label="Walkthrough contents" className="walkthrough-toc">
            <details open>
              <summary>On this page · {article.toc.length} sections</summary>
              <ol>
                {article.toc.map((h) => (
                  <li key={h.id} className={h.level > 3 ? "nested" : ""}>
                    <a href={"#" + h.id}>{h.title}</a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
          <p role="status">{status}</p>
          {imageError && (
            <p role="alert">
              Some screenshots could not load. Check your connection or use the
              original GitHub link.
            </p>
          )}
          <article
            className="walkthrough-body"
            onError={(e) => {
              if (e.target instanceof HTMLImageElement) setImageError(true);
            }}
            onClick={async (e) => {
              const target = e.target as HTMLElement;
              const copy = target.closest(".copy-command");
              if (copy) {
                const text =
                  copy.parentElement?.querySelector("pre")?.textContent || "";
                try {
                  await navigator.clipboard.writeText(text);
                  setStatus("Copied command");
                } catch {
                  setStatus("Select the command text to copy it.");
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
              const link = target.closest("a");
              if (
                link?.getAttribute("href")?.startsWith("/walkthroughs/") &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey
              ) {
                e.preventDefault();
                navigate(link.getAttribute("href")!);
              }
            }}
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </>
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
