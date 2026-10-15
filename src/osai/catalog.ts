import catalog from "./catalog.json";
export type OsaiArticle = {
  slug: string;
  title: string;
  group: string;
  summary: string;
  sources: { title: string; url: string; kind: "official" | "community" }[];
  checkedAt: string;
  attribution?: string;
  contents?: { id: string; title: string }[];
  owasp: string[];
  html: string;
};
export const osaiCatalog = catalog as Omit<OsaiArticle, "html">[];
// Keep reference chapters lazy-loaded, including the OWASP resource directory.
const articles = import.meta.glob<{ default: OsaiArticle }>("./content/*.json");
export async function loadOsaiArticle(
  slug: string,
): Promise<OsaiArticle | null> {
  const load = articles["./content/" + slug + ".json"];
  return load ? (await load()).default : null;
}
