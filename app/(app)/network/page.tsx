"use client";

import { AppHeader } from "@/components/app-header";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  type: "core" | "patent" | "research" | "algorithm" | "data" | "model" | "proof" | "citation" | "link";
  connections: number;
  detail: string;
}

interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  relation?: string;
}

// ── FALLBACK DATA — used when backend is unreachable ──────────────────────────
// These match the prototype screenshot exactly: central hub + 8 satellite nodes
// with all connecting lines pre-wired.
const FALLBACK_NODES: GraphNode[] = [
  { id: "core-1",      label: "IP Core Hub",        x: 50, y: 50, size: 24, type: "core",      connections: 8, detail: "Central IP asset hub" },
  { id: "patent-1",    label: "ZKP Auth Patent",     x: 22, y: 28, size: 16, type: "patent",    connections: 4, detail: "Zero-knowledge authentication (US Patent)" },
  { id: "patent-2",    label: "DeFi AMM Patent",     x: 78, y: 22, size: 16, type: "patent",    connections: 4, detail: "Automated market maker patent" },
  { id: "research-1",  label: "Layer 2 Research",    x: 18, y: 65, size: 14, type: "research",  connections: 3, detail: "Optimistic rollup paper" },
  { id: "algorithm-1", label: "ZK-SNARK Engine",     x: 80, y: 62, size: 14, type: "algorithm", connections: 3, detail: "ZK proof generation algorithm" },
  { id: "data-1",      label: "On-chain Dataset",    x: 35, y: 82, size: 12, type: "data",      connections: 2, detail: "DeFi training dataset" },
  { id: "model-1",     label: "Risk Prediction ML",  x: 66, y: 80, size: 12, type: "model",     connections: 2, detail: "ML risk scoring model" },
  { id: "proof-1",     label: "ZK Ownership Proof",  x:  8, y: 44, size: 10, type: "proof",     connections: 2, detail: "On-chain ZK proof" },
  { id: "citation-1",  label: "Prior Art Reference", x: 92, y: 40, size: 10, type: "citation",  connections: 1, detail: "Academic citation" },
  { id: "link-1",      label: "Cross-chain Ref",     x: 50, y: 12, size:  8, type: "link",      connections: 2, detail: "Cross-chain reference" },
];

const FALLBACK_EDGES: GraphEdge[] = [
  { from: "core-1",      to: "patent-1",    weight: 0.90, relation: "owns" },
  { from: "core-1",      to: "patent-2",    weight: 0.88, relation: "owns" },
  { from: "core-1",      to: "research-1",  weight: 0.72, relation: "cites" },
  { from: "core-1",      to: "algorithm-1", weight: 0.76, relation: "implements" },
  { from: "patent-1",    to: "proof-1",     weight: 0.65, relation: "verified by" },
  { from: "patent-2",    to: "citation-1",  weight: 0.58, relation: "cites" },
  { from: "patent-1",    to: "link-1",      weight: 0.42, relation: "referenced in" },
  { from: "patent-2",    to: "link-1",      weight: 0.45, relation: "referenced in" },
  { from: "research-1",  to: "data-1",      weight: 0.55, relation: "uses" },
  { from: "algorithm-1", to: "model-1",     weight: 0.68, relation: "powers" },
  { from: "data-1",      to: "model-1",     weight: 0.38, relation: "trains" },
];

const NODE_COLORS: Record<GraphNode["type"], string> = {
  core:      "#007BFF",
  patent:    "#00BFFF",
  research:  "#4dabf7",
  algorithm: "#74c0fc",
  data:      "#339af0",
  model:     "#228be6",
  proof:     "#1c7ed6",
  citation:  "#1971c2",
  link:      "#1864ab",
};

// ── normaliseNodes ─────────────────────────────────────────────────────────────
// Converts raw backend node data into typed GraphNode[].
// Handles missing x/y by placing nodes in a circle.
function normaliseNodes(raw: any[]): GraphNode[] {
  if (!raw?.length) return [];

  const xs = raw.map((n) => Number(n.x ?? n.attributes?.x ?? NaN)).filter(isFinite);
  const ys = raw.map((n) => Number(n.y ?? n.attributes?.y ?? NaN)).filter(isFinite);
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 1;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const PAD = 10;

  return raw.map((n, i) => {
    const rawX = Number(n.x ?? n.attributes?.x ?? NaN);
    const rawY = Number(n.y ?? n.attributes?.y ?? NaN);
    let x: number, y: number;
    if (isFinite(rawX) && isFinite(rawY)) {
      x = PAD + ((rawX - minX) / rangeX) * (100 - PAD * 2);
      y = PAD + ((rawY - minY) / rangeY) * (100 - PAD * 2);
    } else {
      const angle = (i / raw.length) * Math.PI * 2 - Math.PI / 2;
      x = 50 + (i === 0 ? 0 : 35) * Math.cos(angle);
      y = 50 + (i === 0 ? 0 : 35) * Math.sin(angle);
    }
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    const rawType = (n.type ?? n.v_type ?? n.attributes?.type ?? "link").toLowerCase();
    const typeMap: Record<string, GraphNode["type"]> = {
      core: "core", "ip asset": "core", ip_asset: "core",
      patent: "patent", research: "research", paper: "research",
      algorithm: "algorithm", algo: "algorithm",
      data: "data", dataset: "data",
      model: "model", proof: "proof", citation: "citation", link: "link",
    };
    const connections = Number(n.connections ?? n.degree ?? 1);
    return {
      id:          String(n.id ?? n.v_id ?? i),
      label:       String(n.label ?? n.attributes?.label ?? n.v_id ?? `Node ${i + 1}`),
      x, y,
      size:        Math.max(8, Math.min(26, 8 + connections * 0.8)),
      type:        typeMap[rawType] ?? "link",
      connections: isFinite(connections) ? connections : 1,
      detail:      String(n.detail ?? n.attributes?.detail ?? n.attributes?.description ?? rawType),
    };
  });
}

// ── normaliseEdges ─────────────────────────────────────────────────────────────
// Accepts every edge shape TigerGraph or our backend can return.
// THE KEY FIX: we accept from/to AND from_id/to_id AND source/target.
function normaliseEdges(raw: any[]): GraphEdge[] {
  if (!raw?.length) return [];
  return raw
    .map((e: any) => ({
      from:     String(e.from     ?? e.from_id ?? e.source ?? e.src ?? ""),
      to:       String(e.to       ?? e.to_id   ?? e.target ?? e.dst ?? ""),
      weight:   Number(e.weight   ?? e.attributes?.weight  ?? 0.5),
      relation: String(e.relation ?? e.attributes?.relation ?? e.label ?? ""),
    }))
    .filter((e) => e.from && e.to && e.from !== e.to);
}

// ── NetworkGraph Canvas Component ─────────────────────────────────────────────
interface NetworkGraphProps {
  zoom: number;
  onNodeClick: (node: GraphNode) => void;
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  showRelations: boolean;
}

function NetworkGraph({ zoom, onNodeClick, hoveredNode, setHoveredNode, nodes, edges, showRelations }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── SIZING: must set canvas pixel dimensions to match CSS layout size ──
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w > 0 && h > 0) { canvas.width = w; canvas.height = h; }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, W, H);

      // ── COORDINATE HELPER ─────────────────────────────────────────────────
      // Single source of truth: node % position → canvas pixel.
      // Both edge endpoints AND node circles use this SAME function,
      // which is why lines always connect correctly to node centers.
      const px = (node: GraphNode) => (node.x / 100) * W;
      const py = (node: GraphNode) => (node.y / 100) * H;

      // ── DRAW EDGES FIRST (behind nodes) ───────────────────────────────────
      edges.forEach((edge) => {
        const A = nodes.find((n) => n.id === edge.from);
        const B = nodes.find((n) => n.id === edge.to);
        if (!A || !B) return;

        const ax = px(A), ay = py(A);
        const bx = px(B), by = py(B);

        // Guard: skip NaN and zero-length edges
        if (!isFinite(ax + ay + bx + by)) return;
        if (Math.abs(ax - bx) < 0.5 && Math.abs(ay - by) < 0.5) return;

        const isHov = hoveredNode === A.id || hoveredNode === B.id;
        const w = edge.weight ?? 0.5;
        const pulse = Math.abs(Math.sin(t * 1.5 + ax * 0.01));

        // Animated marching dashes
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -(t * 18);

        if (isHov) {
          ctx.strokeStyle = `rgba(0,180,255,${0.7 + pulse * 0.25})`;
          ctx.lineWidth   = 2;
          ctx.shadowColor = "#007BFF";
          ctx.shadowBlur  = 10;
        } else {
          ctx.strokeStyle = `rgba(0,150,255,${0.18 + w * 0.28 + pulse * 0.06})`;
          ctx.lineWidth   = 0.8 + w * 0.9;
          ctx.shadowBlur  = 0;
        }

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // ── Travelling particle along edge ────────────────────────────────
        const progress = (t * 0.35 + ax * 0.002) % 1;
        const dotX = ax + (bx - ax) * progress;
        const dotY = ay + (by - ay) * progress;
        ctx.beginPath();
        ctx.arc(dotX, dotY, isHov ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? "rgba(0,220,255,0.95)" : "rgba(0,180,255,0.5)";
        ctx.fill();

        // ── Relation label at edge midpoint ───────────────────────────────
        if (edge.relation && (showRelations || isHov)) {
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          const angle = Math.atan2(by - ay, bx - ax);

          ctx.save();
          ctx.translate(mx, my);
          // Keep text readable: flip if line goes right-to-left
          const flip = Math.abs(angle) > Math.PI / 2;
          ctx.rotate(flip ? angle + Math.PI : angle);

          ctx.font = "9px monospace";
          const tw = ctx.measureText(edge.relation).width;
          const pad = 4;

          ctx.fillStyle = isHov ? "rgba(0,20,60,0.92)" : "rgba(0,10,40,0.78)";
          ctx.beginPath();
          ctx.roundRect(-(tw / 2 + pad), -8, tw + pad * 2, 14, 3);
          ctx.fill();

          ctx.fillStyle = isHov ? "rgba(0,220,255,1)" : `rgba(100,185,255,${0.55 + w * 0.35})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(edge.relation, 0, 1);
          ctx.restore();
        }
      });

      // ── DRAW NODES (on top of edges) ──────────────────────────────────────
      nodes.forEach((node, i) => {
        const x = px(node);
        const y = py(node);
        if (!isFinite(x) || !isFinite(y)) return;

        const isHov    = hoveredNode === node.id;
        const pulse    = Math.sin(t * 1.8 + i * 0.6) * 0.18 + 1;
        const baseSize = Math.max(1, (node.size || 10) * pulse * zoom * (isHov ? 1.35 : 1));
        const color    = NODE_COLORS[node.type] ?? NODE_COLORS.link;

        // Outer ambient glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, baseSize * 2.8);
        grd.addColorStop(0,    color + (isHov ? "bb" : "55"));
        grd.addColorStop(0.45, color + "22");
        grd.addColorStop(1,    color + "00");
        ctx.beginPath();
        ctx.arc(x, y, baseSize * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core filled circle
        ctx.beginPath();
        ctx.arc(x, y, baseSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        if (isHov) { ctx.shadowColor = color; ctx.shadowBlur = 22; }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner white highlight dot
        ctx.beginPath();
        ctx.arc(x, y, baseSize * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fill();

        // Hover ring
        if (isHov) {
          ctx.beginPath();
          ctx.arc(x, y, baseSize * 0.78, 0, Math.PI * 2);
          ctx.strokeStyle = color + "88";
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }

        // Label: always for core nodes, hover-only for others
        if (isHov || node.type === "core") {
          ctx.font      = `${isHov ? "600 " : ""}11px 'GeistMono', monospace`;
          ctx.fillStyle = isHov ? "#fff" : "rgba(255,255,255,0.72)";
          ctx.textAlign = "center";
          ctx.fillText(node.label, x, y - baseSize * 0.9);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [zoom, hoveredNode, nodes, edges, showRelations]);

  // ── Hit test: find which node the mouse is over ───────────────────────────
  const getHitNode = useCallback((e: React.MouseEvent<HTMLCanvasElement>): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect  = canvas.getBoundingClientRect();
    const sx    = canvas.width  / rect.width;
    const sy    = canvas.height / rect.height;
    const mx    = (e.clientX - rect.left) * sx;
    const my    = (e.clientY - rect.top)  * sy;
    for (const node of nodes) {
      const nx = (node.x / 100) * canvas.width;
      const ny = (node.y / 100) * canvas.height;
      if (isFinite(nx) && isFinite(ny) && Math.hypot(mx - nx, my - ny) < (node.size || 10) * zoom * 1.6)
        return node.id;
    }
    return null;
  }, [nodes, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ background: "transparent" }}
      onMouseMove={(e) => {
        const found = getHitNode(e);
        setHoveredNode(found);
        if (canvasRef.current) canvasRef.current.style.cursor = found ? "pointer" : "default";
      }}
      onMouseLeave={() => setHoveredNode(null)}
      onClick={(e) => {
        const id = getHitNode(e);
        if (id) { const n = nodes.find((x) => x.id === id); if (n) onNodeClick(n); }
      }}
    />
  );
}

// ── MiniStat ──────────────────────────────────────────────────────────────────
function MiniStat({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 0 24px 4px rgba(0,123,255,0.18)" }}
      transition={{ duration: 0.35, delay }}
      className="glass-card p-6 text-center cursor-default"
    >
      <p className="font-mono text-xs text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-sentient text-foreground">{value}</p>
    </motion.div>
  );
}

// ── NodeDetailPanel ───────────────────────────────────────────────────────────
function NodeDetailPanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const color = NODE_COLORS[node.type] ?? NODE_COLORS.link;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="absolute top-4 right-4 w-56 glass-card p-4 z-10"
      style={{ border: `1px solid ${color}66`, boxShadow: `0 0 24px ${color}33` }}
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-muted hover:text-foreground text-xs">✕</button>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="font-sentient text-sm text-foreground">{node.label}</span>
      </div>
      <div className="space-y-2">
        {([["Type", node.type, color], ["Links", String(node.connections), undefined], ["Pos", `${node.x.toFixed(0)}%,${node.y.toFixed(0)}%`, undefined]] as [string, string, string | undefined][]).map(([lbl, val, clr]) => (
          <div key={lbl} className="flex justify-between">
            <span className="font-mono text-xs text-muted">{lbl}</span>
            <span className="font-mono text-xs capitalize" style={{ color: clr ?? "inherit" }}>{val}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="font-mono text-xs text-muted">{node.detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  const [zoom, setZoom]                   = useState(1);
  const [hoveredNode, setHoveredNode]     = useState<string | null>(null);
  const [selectedNode, setSelectedNode]   = useState<GraphNode | null>(null);
  const [tigStatus, setTigStatus]         = useState<"idle" | "connecting" | "live">("idle");
  const [nodes, setNodes]                 = useState<GraphNode[]>(FALLBACK_NODES);
  const [edges, setEdges]                 = useState<GraphEdge[]>(FALLBACK_EDGES);
  const [showRelations, setShowRelations] = useState(true);
  const [recentEvents, setRecentEvents]   = useState<{ id: string; label: string; ts: number }[]>([]);

  // ── Fetch graph on mount ─────────────────────────────────────────────────
  // Strategy: call REST endpoint first. If it returns valid nodes+edges, use them.
  // Otherwise keep the FALLBACK data so lines are always visible.
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${BASE}/api/network/graph`)
      .then((r) => r.json())
      .then((data: any) => {
        // Accept nodes from multiple possible response shapes
        const rawNodes: any[] = data?.nodes ?? data?.vertices ?? [];
        // THE KEY FIX: accept edges from BOTH naming conventions
        const rawEdges: any[] = data?.edges ?? data?.links ?? [];

        if (rawNodes.length > 0) {
          const processed = normaliseNodes(rawNodes);
          if (processed.length > 0) setNodes(processed);
        }

        if (rawEdges.length > 0) {
          const processed = normaliseEdges(rawEdges);
          // Only replace fallback edges if we actually got valid ones
          if (processed.length > 0) {
            setEdges(processed);
          }
        }

        // Mark as live if we got real data
        if (rawNodes.length > 0) setTigStatus("live");
      })
      .catch(() => {
        // Backend unreachable — fallback data already set, lines will show
        console.warn("Network: backend unreachable, showing fallback graph");
      });
  }, []);

  // ── SSE — real-time node additions from vault commits ────────────────────
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    let es: EventSource;
    try {
      es = new EventSource(`${BASE}/api/network/events`);

      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // initial_graph: full graph pushed on SSE connect — use it
          if (msg.type === "initial_graph" && msg.payload) {
            const rawNodes: any[] = msg.payload?.nodes ?? [];
            const rawEdges: any[] = msg.payload?.edges ?? [];
            if (rawNodes.length > 0) {
              const n = normaliseNodes(rawNodes);
              if (n.length > 0) setNodes(n);
            }
            if (rawEdges.length > 0) {
              const e = normaliseEdges(rawEdges);
              if (e.length > 0) setEdges(e);
            }
            if (rawNodes.length > 0) setTigStatus("live");
          }

          // node_added: single new node from a vault commit
          if (msg.type === "node_added" && msg.payload?.node) {
            const { node: rawNode, edge: rawEdge } = msg.payload;

            const newNode: GraphNode = {
              id:          String(rawNode.id),
              label:       String(rawNode.label),
              type:        (rawNode.type as GraphNode["type"]) ?? "link",
              x:           10 + Math.random() * 80,
              y:           10 + Math.random() * 80,
              size:        10,
              connections: 1,
              detail:      String(rawNode.detail ?? ""),
            };

            setNodes((prev) => prev.find((n) => n.id === newNode.id) ? prev : [...prev, newNode]);

            if (rawEdge?.from && rawEdge?.to) {
              const newEdge: GraphEdge = {
                from:     String(rawEdge.from ?? rawEdge.from_id ?? ""),
                to:       String(rawEdge.to   ?? rawEdge.to_id   ?? ""),
                weight:   Number(rawEdge.weight   ?? 0.5),
                relation: String(rawEdge.relation ?? "registered"),
              };
              setEdges((prev) => prev.find((e) => e.from === newEdge.from && e.to === newEdge.to) ? prev : [...prev, newEdge]);
            }

            setTigStatus("live");
            if (rawNode.label) {
              setRecentEvents((prev) => [
                { id: String(Date.now()), label: rawNode.label, ts: Date.now() },
                ...prev.slice(0, 4),
              ]);
            }
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => { try { es?.close(); } catch (_) {} };
  }, []);

  const handleTigerConnect = () => {
    setTigStatus("connecting");
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${BASE}/api/network/graph`)
      .then((r) => r.json())
      .then((data: any) => {
        const rawNodes: any[] = data?.nodes ?? data?.vertices ?? [];
        const rawEdges: any[] = data?.edges ?? data?.links ?? [];
        const n = normaliseNodes(rawNodes);
        const e = normaliseEdges(rawEdges);
        if (n.length > 0) { setNodes(n); setTigStatus("live"); } else setTigStatus("idle");
        if (e.length > 0) setEdges(e);
      })
      .catch(() => setTigStatus("idle"));
  };

  const topNodes = [...nodes].sort((a, b) => b.connections - a.connections).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto">
      <AppHeader title="Network" />

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <MiniStat label="Total Nodes"  value={nodes.length.toLocaleString()} delay={0}   />
        <MiniStat label="Connections"  value={edges.length.toLocaleString()} delay={0.1} />
        <MiniStat
          label="Graph Density"
          value={nodes.length > 0 ? (edges.length / nodes.length).toFixed(2) : "0"}
          delay={0.2}
        />
      </div>

      {/* TigerGraph status banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-4 mb-6 flex items-center justify-between"
        style={{
          borderTop: tigStatus === "live"
            ? "1px solid rgba(34,197,94,0.5)"
            : "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              tigStatus === "live"       ? "bg-green-400" :
              tigStatus === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-white/30"
            }`}
            style={{ boxShadow: tigStatus === "live" ? "0 0 8px rgba(34,197,94,0.8)" : undefined }}
          />
          <div>
            <p className="font-mono text-xs text-foreground uppercase tracking-wider">
              TigerGraph Database
              {tigStatus === "live"       && <span className="text-green-400 ml-2">● Live</span>}
              {tigStatus === "connecting" && <span className="text-yellow-400 ml-2">Connecting...</span>}
            </p>
            <p className="font-mono text-xs text-muted mt-0.5">
              {tigStatus === "live"
                ? "REST++ active · GSQL enabled · SSE stream connected · relation labels on"
                : "Connect to enable real-time graph queries"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle relation labels */}
          <button
            onClick={() => setShowRelations((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
              showRelations
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-white/5 border-card-border text-muted hover:text-foreground"
            }`}
          >
            {showRelations ? "⬤ Relations" : "○ Relations"}
          </button>

          {tigStatus !== "live" && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleTigerConnect}
              disabled={tigStatus === "connecting"}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase bg-primary/10 border border-primary/40 text-primary btn-glow hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              {tigStatus === "connecting" ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Connecting
                </span>
              ) : "Connect"}
            </motion.button>
          )}

          {tigStatus === "live" && (
            <span className="font-mono text-xs text-green-400 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              {nodes.length} nodes · {edges.length} edges
            </span>
          )}
        </div>
      </motion.div>

      {/* Graph card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono text-sm text-muted uppercase tracking-wider mb-0.5">
              TigerGraph Visualization
            </h3>
            <p className="font-mono text-xs text-muted">
              {tigStatus === "live"
                ? "Live data · Real-time IP asset relationship mapping"
                : "Fallback graph · click Connect to load live data"}
              {" "}· hover a node to highlight its edges · click to inspect
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted mr-1">{Math.round(zoom * 100)}%</span>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="w-8 h-8 rounded-lg font-mono text-sm bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary transition-all flex items-center justify-center">+
            </motion.button>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="w-8 h-8 rounded-lg font-mono text-sm bg-white/5 border border-card-border text-muted hover:text-foreground hover:border-white/30 transition-all flex items-center justify-center">−
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setZoom(1); setSelectedNode(null); setHoveredNode(null); }}
              className="px-3 py-1.5 rounded-lg font-mono text-xs bg-white/5 border border-card-border text-muted hover:text-foreground hover:border-white/30 transition-all">Reset
            </motion.button>
          </div>
        </div>

        {/* Canvas container — explicit height required for ResizeObserver */}
        <div className="relative h-[480px] rounded-xl bg-black/60 border border-card-border overflow-hidden">
          <NetworkGraph
            zoom={zoom}
            onNodeClick={setSelectedNode}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            nodes={nodes}
            edges={edges}
            showRelations={showRelations}
          />

          <AnimatePresence>
            {selectedNode && (
              <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
            )}
          </AnimatePresence>

          {/* Type legend */}
          <div className="absolute bottom-4 left-4 flex gap-4 flex-wrap pointer-events-none">
            {(["core", "patent", "research", "algorithm", "data"] as const).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[type], boxShadow: `0 0 5px ${NODE_COLORS[type]}` }} />
                <span className="font-mono text-[10px] text-muted capitalize">
                  {type === "core" ? "Core IP" : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoveredNode && !selectedNode && (() => {
              const n = nodes.find((x) => x.id === hoveredNode);
              return n ? (
                <motion.div key={hoveredNode}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-4 right-4 px-3 py-2 rounded-lg glass-card pointer-events-none"
                  style={{ border: `1px solid ${NODE_COLORS[n.type] ?? NODE_COLORS.link}55` }}
                >
                  <p className="font-mono text-xs text-foreground">{n.label}</p>
                  <p className="font-mono text-xs text-muted capitalize">{n.type} · {n.connections} connections</p>
                </motion.div>
              ) : null;
            })()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Live event feed */}
      <AnimatePresence>
        {recentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-4 mb-6"
            style={{ borderTop: "1px solid rgba(34,197,94,0.4)" }}
          >
            <p className="font-mono text-xs text-green-400 uppercase tracking-wider mb-3">⬤ Live — New Nodes Added</p>
            <div className="flex flex-col gap-2">
              {recentEvents.map((ev) => (
                <motion.div key={ev.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between font-mono text-xs"
                >
                  <span className="text-foreground">{ev.label}</span>
                  <span className="text-muted">{new Date(ev.ts).toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top connected nodes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="glass-card p-6"
      >
        <h3 className="font-mono text-sm text-muted mb-4 uppercase tracking-wider">Top Connected Nodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topNodes.map((node, index) => {
            const color = NODE_COLORS[node.type] ?? NODE_COLORS.link;
            return (
              <motion.div
                key={node.id || index}
                whileHover={{ y: -5, boxShadow: `0 0 20px 3px ${color}29`, borderColor: `${color}59` }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelectedNode(node)}
                className="p-4 rounded-lg bg-white/[0.02] border border-card-border cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}99` }} />
                  <p className="font-mono text-sm text-foreground">{node.label}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted capitalize">{node.type}</span>
                  <span className="font-mono text-xs" style={{ color }}>{node.connections} links</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
