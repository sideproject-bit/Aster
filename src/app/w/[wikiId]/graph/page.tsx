"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GraphNode = { id: string; title: string; color: string };
type GraphLink = { source: string; target: string; type: "wikiLink" | "parent" };

export default function GraphPage() {
  const { wikiId } = useParams<{ wikiId: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

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
      <h1 className="mb-4 text-xl font-semibold">문서 연동 그래프</h1>
      <div ref={containerRef} className="min-h-0 flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
        {data && data.nodes.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            아직 문서가 없습니다.
          </div>
        )}
        {data && data.nodes.length > 0 && (
          <ForceGraph2D
            graphData={data}
            width={size.width}
            height={size.height}
            nodeId="id"
            nodeLabel="title"
            nodeColor={(node) => (node as GraphNode).color}
            nodeRelSize={5}
            linkColor={(link) =>
              (link as unknown as GraphLink).type === "wikiLink" ? "#94a3b8" : "#e2e8f0"
            }
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
              ctx.fillStyle = "#525252";
              ctx.fillText(label, n.x, n.y + 7);
            }}
            onNodeClick={(node) => router.push(`/w/${wikiId}/wiki/${(node as GraphNode).id}`)}
          />
        )}
      </div>
    </div>
  );
}
