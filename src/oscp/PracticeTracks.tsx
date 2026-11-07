import { Link, useParams } from "react-router-dom";
import practice from "./practice-tracks.json";
import topics from "./topics.json";
import { collectionId, mapHref } from "./graph";
import "./oscp.css";

export default function PracticeTracks() {
  const { trackId } = useParams();
  const index = practice.tracks.findIndex((t) => t.id === trackId);
  const track = practice.tracks[index];
  if (trackId && !track)
    return (
      <section className="page">
        <h1>Practice track not found</h1>
        <Link to="/practice-tracks">Browse practice tracks</Link>
      </section>
    );
  return (
    <section className="page oscp-page">
      <div className="oscp-heading">
        <div>
          <p className="eyebrow">OSCP / PRACTISE WITH PURPOSE</p>
          <h1>{track?.title || "Practice tracks"}</h1>
          <p className="subtitle">
            {track?.summary ||
              "Seven guided tracks. Learn the idea, test it in a lab, and keep the evidence."}
          </p>
        </div>
        <Link
          className="oscp-link-button"
          to={mapHref(
            track ? "track:" + track.id : collectionId("Practice tracks"),
          )}
        >
          {track ? "See track in Mindmap ↗" : "See all tracks in Mindmap ↗"}
        </Link>
      </div>
      {!track ? (
        <>
          <div className="oscp-hero">
            <div>
              <p className="eyebrow">
                FROM A SMALL DRILL TO A COMPLETE INVESTIGATION
              </p>
              <h2>Explain it. Try it. Record it.</h2>
              <p>
                Follow the order below, or revisit the skill that blocked your
                last lab. Write a short report after every exercise; the final
                track helps you refine it.
              </p>
              <Link
                className="oscp-link-button"
                to="/practice-tracks/enumeration"
              >
                Start with enumeration →
              </Link>
            </div>
            <div className="oscp-hero-steps">
              <Link to="/topics">01 · Review the connected concept</Link>
              <Link to="/machines">02 · Choose an assigned lab</Link>
              <Link to="/notes">03 · Keep your evidence and questions</Link>
            </div>
          </div>
          <p className="subtitle">
            Original exercises with references from OSCP-Tricks-2023 and
            PEN-200-OSCP. Session lengths are suggestions. Use your own or
            assigned training labs.
          </p>
          <div className="oscp-topic-grid">
            {practice.tracks.map((t, i) => (
              <article className="oscp-topic-card" key={t.id}>
                <span className="oscp-topic-number">
                  {String(i + 1).padStart(2, "0")} / {t.level}
                </span>
                <h2>
                  <Link to={"/practice-tracks/" + t.id}>{t.title}</Link>
                </h2>
                <p>{t.summary}</p>
                <small>
                  {t.duration} · {t.steps.length} steps
                </small>
                <div className="row">
                  <Link to={"/practice-tracks/" + t.id}>Start track →</Link>
                  <Link to={mapHref("track:" + t.id)}>View connections</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="quiet">
            Sources reviewed {practice.reviewedAt}. These community references
            include historical material; this learning sequence is not an
            official exam syllabus.
          </p>
        </>
      ) : (
        <>
          <p>
            <Link to="/practice-tracks">← All practice tracks</Link>
          </p>
          <p className="oscp-topic-number">
            TRACK {index + 1} OF {practice.tracks.length} · {track.level} ·{" "}
            {track.duration}
          </p>
          <div className="oscp-reading">
            <article className="oscp-lesson">
              <h2>Understand the idea</h2>
              <p>{track.explanation}</p>
              <h2>Set up your practice</h2>
              <p>{track.setup}</p>
              <h2>Exercise</h2>
              <ol className="practice-exercises">
                {track.steps.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.action}</p>
                    <div className="practice-observation">
                      <strong>Expected observation</strong>
                      <p>{step.expected}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <h2>If you get stuck</h2>
              <ul>
                {track.troubleshooting.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <h2>Evidence to keep</h2>
              <ul>
                {track.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="oscp-check">
                <strong>Check your understanding</strong>
                <p>{track.checkpoint}</p>
                <Link to="/notes">Write your practice note →</Link>
              </div>
            </article>
            <aside className="oscp-sidecard">
              <h2>Connected concepts</h2>
              {track.topicIds.map((id) => (
                <Link key={id} to={"/topics/" + id}>
                  {topics.find((t) => t.id === id)?.title} →
                </Link>
              ))}
              <h3>Use your library</h3>
              {track.related.map((link) => (
                <Link key={link.href} to={link.href}>
                  {link.label} →
                </Link>
              ))}
              <h3>Connect your notes</h3>
              <p>
                Tag your note with <code>{track.topicIds[0]}</code> to connect
                it to the concept. Add a link to this track to create a direct
                backlink in the Mindmap.
              </p>
              <h3>Source references</h3>
              <p>
                Original learning exercises; the links below open the reviewed
                source revision.
              </p>
              {track.sources.map((ref) => {
                const source =
                  practice.sources[ref.source as keyof typeof practice.sources];
                return (
                  <div className="practice-source" key={ref.source + ref.path}>
                    <a
                      href={`https://github.com/${source.repository}/blob/${source.commit}/${ref.path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.name} · {ref.label} ↗
                    </a>
                    <small>
                      {source.credit} · {source.commit.slice(0, 7)}
                    </small>
                  </div>
                );
              })}
              <p className="quiet">
                Reviewed {practice.reviewedAt}. Source commands have not been
                retested here.
              </p>
            </aside>
          </div>
          <nav className="practice-next" aria-label="Practice sequence">
            {index > 0 && (
              <Link to={"/practice-tracks/" + practice.tracks[index - 1].id}>
                ← Previous: {practice.tracks[index - 1].title}
              </Link>
            )}
            {index + 1 < practice.tracks.length ? (
              <Link to={"/practice-tracks/" + practice.tracks[index + 1].id}>
                Next: {practice.tracks[index + 1].title} →
              </Link>
            ) : (
              <Link to="/practice-tracks">Return to all tracks →</Link>
            )}
          </nav>
        </>
      )}
    </section>
  );
}
