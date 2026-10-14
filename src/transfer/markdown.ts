import type { JSONContent } from "@tiptap/core";
import { zipSync, strToU8 } from "fflate";
import { collectBackup } from "./backup";
const escape = (text: string) => text.replace(/[\\`*_[\]<>]/g, "\\$&");
export function toMarkdown(
  node: JSONContent,
  images: Record<string, string>,
  links: Record<string, string> = {},
): string {
  const children = () =>
    (node.content || []).map((n) => toMarkdown(n, images, links)).join("");
  switch (node.type) {
    case "doc":
      return children();
    case "text": {
      let text = escape(node.text || "");
      for (const mark of node.marks || []) {
        if (mark.type === "code") {
          const ticks = "`".repeat(
            Math.max(
              0,
              ...((node.text || "").match(/`+/g) || []).map((s) => s.length),
            ) + 1,
          );
          text = ticks + " " + (node.text || "") + " " + ticks;
        } else if (mark.type === "bold") text = "**" + text + "**";
        else if (mark.type === "italic") text = "*" + text + "*";
        else if (mark.type === "strike") text = "~~" + text + "~~";
        else if (mark.type === "link") {
          const href = String(mark.attrs?.href || "");
          text =
            "[" +
            text +
            "](" +
            (links[href] || href).replace(/[()\s]/g, (c) =>
              encodeURIComponent(c),
            ) +
            ")";
        }
      }
      return text;
    }
    case "paragraph":
      return children() + "\n\n";
    case "heading":
      return (
        "#".repeat(Number(node.attrs?.level) || 2) + " " + children() + "\n\n"
      );
    case "codeBlock": {
      const text = (node.content || []).map((n) => n.text || "").join(""),
        ticks = "`".repeat(
          Math.max(2, ...(text.match(/`+/g) || []).map((s) => s.length)) + 1,
        );
      return ticks + "\n" + text + "\n" + ticks + "\n\n";
    }
    case "screenshot":
      return (
        "![" +
        escape(String(node.attrs?.alt || "Screenshot")) +
        "](" +
        (images[node.attrs?.imageId] || "MISSING-IMAGE") +
        ")\n\n"
      );
    case "hardBreak":
      return "  \n";
    case "horizontalRule":
      return "---\n\n";
    case "bulletList":
    case "orderedList":
    case "taskList":
      return (
        (node.content || [])
          .map((n, i) => {
            const prefix =
              node.type === "orderedList"
                ? `${i + 1}. `
                : node.type === "taskList"
                  ? `- [${n.attrs?.checked ? "x" : " "}] `
                  : "- ";
            return (
              prefix +
              toMarkdown(n, images, links).trim().replace(/\n/g, "\n  ") +
              "\n"
            );
          })
          .join("") + "\n"
      );
    case "blockquote":
      return (
        children()
          .trim()
          .split("\n")
          .map((l) => "> " + l)
          .join("\n") + "\n\n"
      );
    default:
      return children();
  }
}
export async function exportMarkdown(uid: string) {
  const { bundle, report } = await collectBackup(uid),
    files: Record<string, Uint8Array> = {},
    images: Record<string, string> = {},
    links = Object.fromEntries(
      bundle.notes.map((n) => ["/notes/" + n.id, "note-" + n.id + ".md"]),
    );
  for (const image of bundle.images) {
    const match = /^data:image\/(png|jpeg|webp|gif);base64,(.*)$/.exec(
      image.data,
    )!;
    const path = "images/" + image.id + "." + match[1];
    images[image.id] = path;
    files[path] = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  }
  for (const note of bundle.notes)
    files["note-" + note.id + ".md"] = strToU8(
      "# " +
        escape(note.content.title) +
        "\n\n" +
        (note.content.deletedAt !== null ? "> In trash\n\n" : "") +
        toMarkdown(JSON.parse(note.content.contentJson), images, links),
    );
  files["EXPORT-REPORT.json"] = strToU8(JSON.stringify(report, null, 2));
  return {
    blob: new Blob([zipSync(files).buffer as ArrayBuffer], {
      type: "application/zip",
    }),
    report,
  };
}
