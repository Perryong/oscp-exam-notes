import catalog from "./catalog.json";
export { catalog };
export const categoryName = (category: string) =>
  ({
    hackthebox: "Hack The Box",
    thm: "TryHackMe",
    dvwa: "DVWA",
    dockerlabs: "DockerLabs",
    "homemade-labs": "Home-made labs",
    "portswigger-web-security-academy": "PortSwigger",
    "mutillidae-ii": "Mutillidae II",
    "secure-bank": "SecureBank",
    vulnhub: "VulnHub",
  })[category] || "Overview";
export function machineWalkthrough(name: string, platform: string) {
  const category =
    platform === "HackTheBox"
      ? "hackthebox"
      : platform === "TryHackMe"
        ? "thm"
        : platform === "VulnHub"
          ? "vulnhub"
          : null;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return catalog.articles.find(
    (a) => a.category === category && normalize(a.title) === normalize(name),
  );
}
