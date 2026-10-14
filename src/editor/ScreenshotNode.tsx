import { createContext, useContext, useEffect, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { ImageRecord } from "../notebook/model";
export const ImageLoader = createContext<
  (id: string) => Promise<ImageRecord | null>
>(async () => null);
export default function ScreenshotNode({ node }: NodeViewProps) {
  const load = useContext(ImageLoader),
    [data, setData] = useState(""),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    load(node.attrs.imageId)
      .then((img) => {
        if (active) {
          setData(img?.data || "");
          setFailed(!img);
        }
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [node.attrs.imageId, load]);
  return (
    <NodeViewWrapper contentEditable={false}>
      {data ? (
        <img src={data} alt={node.attrs.alt || "Screenshot"} />
      ) : (
        <span className="muted">
          {failed
            ? "Screenshot unavailable on this device"
            : "Loading screenshot…"}
        </span>
      )}
    </NodeViewWrapper>
  );
}
