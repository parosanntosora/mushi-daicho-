import { useEffect, useRef, useState, useCallback } from "react";
import { useData } from "../store/DataContext.jsx";
import { Header } from "../components/Header.jsx";
import { EmptyState } from "../components/ui/Bits.jsx";
import { IconTree } from "../components/icons.jsx";
import { individualDisplayName } from "../utils/constants.js";

// ─── Constants ────────────────────────────────────────────────
const R = 30;            // node radius
const LABEL_Y = R + 17;  // name label offset from center

// ─── Helpers ─────────────────────────────────────────────────
function genLevel(g) {
  const u = String(g || "").toUpperCase().trim();
  if (u === "WD") return 0;
  const m = u.match(/^F(\d+)/);
  return m ? Math.min(Number(m[1]), 10) : 4;
}

function nodeStyle(ind) {
  const isWD = String(ind.generation || "").toUpperCase().trim() === "WD";
  if (isWD) return { fill: "#F1DFC8", stroke: "#A85A23", text: "#7A4117" };
  const map = {
    alive:       { fill: "#DCEAE0", stroke: "#2F5D45", text: "#1C1E1B" },
    dead:        { fill: "#E8E8E6", stroke: "#76787A", text: "#555759" },
    transferred: { fill: "#DCE9F5", stroke: "#2E5C8C", text: "#1A2A3C" },
    sold:        { fill: "#F2E9CC", stroke: "#A0801A", text: "#4A3A0A" },
  };
  return map[ind.status || "alive"] ?? map.alive;
}

function sexSym(sex) {
  return sex === "male" ? "♂" : sex === "female" ? "♀" : "";
}

function trunc(str, n = 7) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

// ─── Graph build ──────────────────────────────────────────────
function buildGraph(individuals, W, H) {
  // Group by generation level for initial Y placement
  const byLv = {};
  individuals.forEach(ind => {
    const lv = genLevel(ind.generation);
    (byLv[lv] = byLv[lv] || []).push(ind);
  });

  const levels = Object.keys(byLv).map(Number).sort((a, b) => a - b);
  const topLv = levels[0] ?? 0;
  const totalH = (levels[levels.length - 1] ?? 0 - topLv) * 180;
  const cx = W / 2, cy = H / 2;

  const nodes = individuals.map(ind => {
    const lv = genLevel(ind.generation);
    const list = byLv[lv];
    const idx = list.indexOf(ind);
    const n = list.length;
    const spanX = Math.max(n * 120, 240);
    const x = cx - spanX / 2 + (n === 1 ? spanX / 2 : idx * spanX / (n - 1));
    const y = cy - totalH / 2 + (lv - topLv) * 180;
    return {
      id: ind.id, individual: ind,
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: 0, vy: 0, fixed: false,
    };
  });

  const ids = new Set(individuals.map(i => i.id));
  const edges = [];
  individuals.forEach(ind => {
    if (ind.fatherId && ids.has(ind.fatherId)) edges.push({ source: ind.fatherId, target: ind.id });
    if (ind.motherId && ids.has(ind.motherId)) edges.push({ source: ind.motherId, target: ind.id });
  });

  return { nodes, edges };
}

// ─── Force simulation ─────────────────────────────────────────
function simulate(nodes, edges, iters = 300) {
  if (!nodes.length) return;
  const byId = new Map(nodes.map(n => [n.id, n]));
  const pairs = edges.map(e => [byId.get(e.source), byId.get(e.target)]).filter(([a, b]) => a && b);

  for (let it = 0; it < iters; it++) {
    const a0 = 1 - it / iters; // cooling

    // Repulsion between every pair
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy || 0.01;
        const d = Math.sqrt(d2);
        const str = (6000 * a0) / d2;
        a.vx -= str * dx / d; a.vy -= str * dy / d;
        b.vx += str * dx / d; b.vy += str * dy / d;
      }
    }

    // Spring along edges
    pairs.forEach(([a, b]) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const str = 0.055 * (d - 145) * a0;
      a.vx += str * dx / d; a.vy += str * dy / d;
      b.vx -= str * dx / d; b.vy -= str * dy / d;
    });

    // Light center gravity
    const cx0 = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
    const cy0 = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    nodes.forEach(n => {
      n.vx += 0.006 * (cx0 - n.x) * a0;
      n.vy += 0.006 * (cy0 - n.y) * a0;
    });

    // Integrate
    nodes.forEach(n => {
      if (n.fixed) { n.vx = 0; n.vy = 0; return; }
      n.x += n.vx; n.y += n.vy;
      n.vx *= 0.5; n.vy *= 0.5;
    });
  }
}

// ─── Fit-to-screen ────────────────────────────────────────────
function calcFit(nodes, W, H) {
  if (!nodes.length) return { x: 0, y: 0, scale: 1 };
  const pad = R + 50;
  const minX = Math.min(...nodes.map(n => n.x)) - pad;
  const maxX = Math.max(...nodes.map(n => n.x)) + pad;
  const minY = Math.min(...nodes.map(n => n.y)) - pad;
  const maxY = Math.max(...nodes.map(n => n.y)) + pad + LABEL_Y;
  const scale = Math.min(2.0, Math.min(W / (maxX - minX), H / (maxY - minY)) * 0.9);
  return {
    x: (W - (minX + maxX) * scale) / 2,
    y: (H - (minY + maxY) * scale) / 2,
    scale,
  };
}

// ─── Component ────────────────────────────────────────────────
export function FamilyTree({ onOpenIndividual }) {
  const { individuals } = useData();
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef(null);
  const tapRef = useRef(null);
  const pinchRef = useRef(null);
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [, rerender] = useState(0);

  const tick = useCallback(() => rerender(t => t + 1), []);
  const applyView = useCallback((v) => { viewRef.current = v; setViewState({ ...v }); }, []);

  // ── Build & simulate ──────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    const W = el?.clientWidth || 360;
    const H = el?.clientHeight || 540;
    const { nodes, edges } = buildGraph(individuals, W, H);
    simulate(nodes, edges, 320);
    nodesRef.current = nodes;
    edgesRef.current = edges;
    applyView(calcFit(nodes, W, H));
    tick();
  }, [individuals, applyView, tick]);

  // ── Coord helpers ─────────────────────────────────────────
  const toGraph = useCallback((sx, sy) => {
    const v = viewRef.current;
    return { x: (sx - v.x) / v.scale, y: (sy - v.y) / v.scale };
  }, []);

  const hitTest = useCallback((sx, sy) => {
    const g = toGraph(sx, sy);
    const HIT = R * 1.5;
    return nodesRef.current.find(n => {
      const dx = n.x - g.x, dy = n.y - g.y;
      return dx * dx + dy * dy <= HIT * HIT;
    }) ?? null;
  }, [toGraph]);

  // ── Mouse events ─────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const node = hitTest(sx, sy);
    if (node) {
      node.fixed = true;
      const g = toGraph(sx, sy);
      dragRef.current = { type: "node", nodeId: node.id, ox: g.x - node.x, oy: g.y - node.y };
      tapRef.current = { sx, sy, time: Date.now() };
    } else {
      const v = viewRef.current;
      dragRef.current = { type: "pan", startX: sx - v.x, startY: sy - v.y };
    }
  }, [hitTest, toGraph]);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (dragRef.current.type === "node") {
      const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId);
      if (node) {
        const g = toGraph(sx, sy);
        node.x = g.x - dragRef.current.ox;
        node.y = g.y - dragRef.current.oy;
        if (tapRef.current) {
          const dx = sx - tapRef.current.sx, dy = sy - tapRef.current.sy;
          if (dx * dx + dy * dy > 80) tapRef.current = null;
        }
        tick();
      }
    } else {
      applyView({ x: sx - dragRef.current.startX, y: sy - dragRef.current.startY, scale: viewRef.current.scale });
    }
  }, [toGraph, tick, applyView]);

  const onMouseUp = useCallback(() => {
    const d = dragRef.current, t = tapRef.current;
    if (d?.type === "node") {
      const node = nodesRef.current.find(n => n.id === d.nodeId);
      if (node) {
        node.fixed = false;
        if (t && Date.now() - t.time < 280) onOpenIndividual(node.id);
      }
    }
    dragRef.current = null; tapRef.current = null;
  }, [onOpenIndividual]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const v = viewRef.current;
    const factor = e.deltaY > 0 ? 0.88 : 1.13;
    const ns = Math.max(0.18, Math.min(4.5, v.scale * factor));
    const r = ns / v.scale;
    applyView({ x: sx - r * (sx - v.x), y: sy - r * (sy - v.y), scale: ns });
  }, [applyView]);

  // ── Touch events (non-passive) ────────────────────────────
  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const sx = t.clientX - rect.left, sy = t.clientY - rect.top;
      const node = hitTest(sx, sy);
      if (node) {
        node.fixed = true;
        const g = toGraph(sx, sy);
        dragRef.current = { type: "node", nodeId: node.id, ox: g.x - node.x, oy: g.y - node.y };
        tapRef.current = { sx, sy, time: Date.now() };
      } else {
        const v = viewRef.current;
        dragRef.current = { type: "pan", startX: sx - v.x, startY: sy - v.y };
      }
      pinchRef.current = null;
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const x1 = t1.clientX - rect.left, y1 = t1.clientY - rect.top;
      const x2 = t2.clientX - rect.left, y2 = t2.clientY - rect.top;
      pinchRef.current = {
        startDist: Math.hypot(x2 - x1, y2 - y1),
        startScale: viewRef.current.scale,
        midX: (x1 + x2) / 2, midY: (y1 + y2) / 2,
        startX: viewRef.current.x, startY: viewRef.current.y,
      };
      dragRef.current = null; tapRef.current = null;
    }
  }, [hitTest, toGraph]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    if (e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const x1 = t1.clientX - rect.left, y1 = t1.clientY - rect.top;
      const x2 = t2.clientX - rect.left, y2 = t2.clientY - rect.top;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const { startDist, startScale, midX, midY, startX, startY } = pinchRef.current;
      const ns = Math.max(0.18, Math.min(4.5, startScale * dist / startDist));
      const r = ns / startScale;
      applyView({ x: midX - r * (midX - startX), y: midY - r * (midY - startY), scale: ns });
      return;
    }
    if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const sx = t.clientX - rect.left, sy = t.clientY - rect.top;
      if (dragRef.current.type === "node") {
        const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId);
        if (node) {
          const g = toGraph(sx, sy);
          node.x = g.x - dragRef.current.ox;
          node.y = g.y - dragRef.current.oy;
          if (tapRef.current) {
            const dx = sx - tapRef.current.sx, dy = sy - tapRef.current.sy;
            if (dx * dx + dy * dy > 80) tapRef.current = null;
          }
          tick();
        }
      } else {
        applyView({ x: sx - dragRef.current.startX, y: sy - dragRef.current.startY, scale: viewRef.current.scale });
      }
    }
  }, [toGraph, tick, applyView]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      const d = dragRef.current, t = tapRef.current;
      if (d?.type === "node") {
        const node = nodesRef.current.find(n => n.id === d.nodeId);
        if (node) {
          node.fixed = false;
          if (t && Date.now() - t.time < 300) onOpenIndividual(node.id);
        }
      }
      dragRef.current = null; tapRef.current = null; pinchRef.current = null;
    } else if (e.touches.length === 1) {
      pinchRef.current = null;
      const rect = containerRef.current.getBoundingClientRect();
      const t = e.touches[0];
      const sx = t.clientX - rect.left, sy = t.clientY - rect.top;
      const v = viewRef.current;
      dragRef.current = { type: "pan", startX: sx - v.x, startY: sy - v.y };
    }
  }, [onOpenIndividual]);

  // Attach non-passive touch listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const opts = { passive: false };
    el.addEventListener("touchstart", onTouchStart, opts);
    el.addEventListener("touchmove", onTouchMove, opts);
    el.addEventListener("touchend", onTouchEnd, opts);
    return () => {
      el.removeEventListener("touchstart", onTouchStart, opts);
      el.removeEventListener("touchmove", onTouchMove, opts);
      el.removeEventListener("touchend", onTouchEnd, opts);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  const handleFit = () => {
    const el = containerRef.current;
    if (!el || !nodesRef.current.length) return;
    applyView(calcFit(nodesRef.current, el.clientWidth, el.clientHeight));
  };

  // ── Render ────────────────────────────────────────────────
  const { x, y, scale } = viewState;
  const nodes = nodesRef.current;
  const edges = edgesRef.current;
  const byId = new Map(nodes.map(n => [n.id, n]));

  if (!individuals.length) {
    return (
      <div className="screen">
        <Header title="家系図" />
        <div className="scroll-area">
          <EmptyState
            icon={<IconTree />}
            title="家系図はまだありません"
            description={"個体を登録して父・母を設定すると\nここに血統ツリーが表示されます"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ overflow: "hidden" }}>
      <Header title="家系図" subtitle={`${individuals.length}匹`} />

      <div
        ref={containerRef}
        className="graph-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <svg width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0 0 L8 3 L0 6 z" fill="#CFCFC8" />
            </marker>
          </defs>

          <g transform={`translate(${x},${y}) scale(${scale})`}>
            {/* Edges */}
            {edges.map((e, i) => {
              const a = byId.get(e.source), b = byId.get(e.target);
              if (!a || !b) return null;
              // Bezier: exit bottom of parent, enter top of child
              const dy = Math.abs(b.y - a.y);
              const cp = dy * 0.55;
              const d = `M ${a.x} ${a.y} C ${a.x} ${a.y + cp} ${b.x} ${b.y - cp} ${b.x} ${b.y}`;
              const isDead = a.individual.status === "dead" || b.individual.status === "dead";
              return (
                <path key={i} d={d}
                  stroke="#CFCFC8" strokeWidth={1.8} fill="none"
                  strokeDasharray={isDead ? "5 4" : undefined}
                  markerEnd="url(#arrowhead)"
                  opacity={0.8}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const ind = node.individual;
              const c = nodeStyle(ind);
              const name = trunc(individualDisplayName(ind), 8);
              const gen = String(ind.generation || "").toUpperCase().trim();
              const sym = sexSym(ind.sex);

              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: "pointer" }}>
                  {/* Soft drop shadow */}
                  <circle r={R + 2} fill="rgba(28,30,27,0.09)" cx={0} cy={2} />
                  {/* Background circle */}
                  <circle r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2.4} />

                  {/* Generation label (inside top of circle) */}
                  {gen && (
                    <text y={-R + 15} textAnchor="middle"
                      fill={c.stroke} fontSize={9} fontWeight={800}
                      fontFamily="'JetBrains Mono', monospace"
                      style={{ pointerEvents: "none", userSelect: "none" }}>
                      {gen}
                    </text>
                  )}

                  {/* Sex symbol (center) */}
                  {sym ? (
                    <text y={gen ? 8 : 5} textAnchor="middle"
                      fill={c.stroke} fontSize={16} fontWeight={700}
                      style={{ pointerEvents: "none", userSelect: "none" }}>
                      {sym}
                    </text>
                  ) : (
                    <circle r={4} fill={c.stroke} opacity={0.5} />
                  )}

                  {/* Name label below circle */}
                  <text y={LABEL_Y} textAnchor="middle"
                    fill="#1C1E1B" fontSize={11} fontWeight={700}
                    fontFamily="'Zen Kaku Gothic New', sans-serif"
                    style={{ pointerEvents: "none", userSelect: "none" }}>
                    {name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Controls */}
        <div className="graph-controls">
          <button className="graph-ctrl-btn" onClick={handleFit} title="全体を表示">
            ⊡
          </button>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          {[
            { fill: "#F1DFC8", stroke: "#A85A23", label: "WD" },
            { fill: "#DCEAE0", stroke: "#2F5D45", label: "生存中" },
            { fill: "#E8E8E6", stroke: "#76787A", label: "死亡" },
            { fill: "#DCE9F5", stroke: "#2E5C8C", label: "譲渡済" },
          ].map(({ fill, stroke, label }) => (
            <div className="graph-legend-row" key={label}>
              <div className="graph-legend-dot" style={{ background: fill, borderColor: stroke }} />
              {label}
            </div>
          ))}
        </div>

        {/* Usage hint */}
        <div className="graph-hint">タップで詳細 · ドラッグで移動</div>
      </div>
    </div>
  );
}
