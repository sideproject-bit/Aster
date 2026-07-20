"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import type { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const BRAND = "#fec01f";
const BRAND_DIM = "rgba(254, 192, 31, 0.55)";

type GraphNode = { id: string; title: string; tagColor: string | null };
type GraphLink = { source: string; target: string; type: "wikiLink" | "parent" };

export default function GraphPage() {
  const { wikiId } = useParams<{ wikiId: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === "dark";
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>(undefined);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    fetch(`/api/graph?wikiId=${wikiId}`)
      .then((res) => res.json())
      .then(setData);
  }, [wikiId]);

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-xl font-semibold">{t("graph.title")}</h1>
      <div ref={containerRef} className="min-h-0 flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
        {data && data.nodes.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            {t("graph.empty")}
          </div>
        )}
        {data && data.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            width={size.width}
            height={size.height}
            backgroundColor="transparent"
            onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
            nodeId="id"
            nodeLabel="title"
            nodeColor={(node) => {
              const n = node as GraphNode;
              return n.tagColor ?? (isDark ? BRAND : "#171717");
            }}
            nodeRelSize={5}
            linkColor={() => (isDark ? BRAND_DIM : BRAND)}
            linkDirectionalArrowLength={(link) =>
              (link as unknown as GraphLink).type === "wikiLink" ? 4 : 0
            }
            linkLineDash={(link) =>
              (link as unknown as GraphLink).type === "parent" ? [2, 2] : null
            }
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as GraphNode & { x: number; y: number };
              const label = n.title;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = isDark ? "#d4d4d4" : "#525252";
              ctx.fillText(label, n.x, n.y + 7);
            }}
            onNodeClick={(node) => router.push(`/w/${wikiId}/wiki/${(node as GraphNode).id}`)}
          />
        )}
      </div>
    </div>
  );
}
