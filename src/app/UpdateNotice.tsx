import { useEffect, useState } from "react";
import { applyShellUpdate, isShellUpdateReady } from "../pwa";
export default function UpdateNotice() {
  const [ready, setReady] = useState(isShellUpdateReady),
    [error, setError] = useState("");
  useEffect(() => {
    const ready = () => setReady(true);
    window.addEventListener("notebook-update", ready);
    setReady(isShellUpdateReady());
    return () => window.removeEventListener("notebook-update", ready);
  }, []);
  return ready ? (
    <div className="status">
      An app update is ready.{" "}
      <button
        onClick={() =>
          void applyShellUpdate().catch((e) => setError(String(e)))
        }
      >
        Update after saving
      </button>
      {error}
    </div>
  ) : null;
}
