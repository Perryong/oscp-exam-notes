// Run this function in the developer console on the OLD notebook origin.
// It reads only the legacy localStorage keys and never evaluates note HTML.
(async () => {
  const legacySources = {},
    unmatchedProgress = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^oscp-note-\d+$/.test(key))
      legacySources["browser:" + key.slice(10)] = localStorage.getItem(key);
  }
  const raw = localStorage.getItem("oscp-ladder");
  if (raw) {
    legacySources["raw-progress"] = raw;
    try {
      Object.assign(unmatchedProgress, JSON.parse(raw));
    } catch {}
  }
  const bundle = {
    version: 1,
    notes: [],
    machines: [],
    history: {},
    images: [],
    legacySources,
    unmatchedProgress,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(bundle)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "oscp-legacy-sources.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
})();
