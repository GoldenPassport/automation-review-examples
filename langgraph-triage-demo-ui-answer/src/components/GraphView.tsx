import type { NodeId } from "../lib/graph";

/**
 * Visual representation of the triage graph with per-node status.
 *
 * States:
 *   - idle:    node has not run yet (pale outline)
 *   - running: node is currently executing (gold fill, pulse)
 *   - done:    node has emitted its update (emerald fill)
 *   - skipped: branch was not taken (very faint outline)
 */
export type NodeStatus = "idle" | "running" | "done" | "skipped";

export type NodeStatusMap = Partial<Record<NodeId, NodeStatus>>;

/** Default state palette for pipeline nodes (classify / extract / validate / decide). */
const COLOURS = {
  idle: { fill: "#fefcf8", stroke: "#b8893b66", text: "#5b6577" },
  running: { fill: "#b8893b", stroke: "#8c661f", text: "#fefcf8" },
  done: { fill: "#047857", stroke: "#065f46", text: "#fefcf8" },
  skipped: { fill: "#f5eddc", stroke: "#b8893b22", text: "#b8893b66" },
};

/**
 * Per-branch palettes for the three terminal nodes. Each branch keeps its
 * semantic colour at every state — idle / running / done / skipped — just
 * at different intensities. Matches the static diagram in the article.
 *
 *   autoProcess     → emerald (positive)
 *   queueForReview  → amber   (neutral / pause)
 *   reject          → red     (negative)
 */
type Palette = { light: string; strong: string; deep: string };
const BRANCH_PALETTES: Partial<Record<NodeId, Palette>> = {
  autoProcess: { light: "#ecfdf5", strong: "#047857", deep: "#065f46" },
  queueForReview: { light: "#fffbeb", strong: "#b45309", deep: "#92400e" },
  reject: { light: "#fef2f2", strong: "#b91c1c", deep: "#991b1b" },
};

function colourFor(
  id: NodeId,
  status: NodeStatus,
): { fill: string; stroke: string; text: string } {
  const palette = BRANCH_PALETTES[id];
  if (!palette) return COLOURS[status];

  switch (status) {
    case "idle":
      return { fill: palette.light, stroke: palette.strong, text: palette.strong };
    case "running":
      return { fill: palette.strong, stroke: palette.deep, text: "#fefcf8" };
    case "done":
      return { fill: palette.strong, stroke: palette.deep, text: "#fefcf8" };
    case "skipped":
      // Faded but still recognisably the branch colour.
      return {
        fill: palette.light,
        stroke: `${palette.strong}40`,
        text: `${palette.strong}80`,
      };
  }
}

const NODE_LABELS: Record<NodeId, string> = {
  classify: "classify",
  extract: "extract",
  validate: "validate",
  decide: "decide",
  autoProcess: "auto-process",
  queueForReview: "human-review",
  reject: "reject",
};

const NODE_POS: Record<NodeId, { x: number; y: number; w: number }> = {
  classify: { x: 280, y: 70, w: 140 },
  extract: { x: 280, y: 130, w: 140 },
  validate: { x: 280, y: 190, w: 140 },
  decide: { x: 280, y: 250, w: 140 },
  autoProcess: { x: 60, y: 330, w: 160 },
  queueForReview: { x: 270, y: 330, w: 160 },
  reject: { x: 480, y: 330, w: 160 },
};

export function GraphView({ statuses }: { statuses: NodeStatusMap }) {
  const get = (id: NodeId): NodeStatus => statuses[id] ?? "idle";

  return (
    <svg
      viewBox="0 0 700 460"
      role="img"
      aria-label="Triage graph workflow"
      style={{ width: "100%", height: "auto", maxWidth: 720 }}
    >
      <defs>
        <marker
          id="ga-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#8c661f" />
        </marker>
      </defs>

      {/* Edges */}
      <g
        stroke="#8c661f"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#ga-arrow)"
      >
        <line x1="350" y1="50" x2="350" y2="68" />
        <line x1="350" y1="110" x2="350" y2="128" />
        <line x1="350" y1="170" x2="350" y2="188" />
        <line x1="350" y1="230" x2="350" y2="248" />
        <path d="M 350 290 C 350 310, 140 310, 140 328" />
        <line x1="350" y1="290" x2="350" y2="328" />
        <path d="M 350 290 C 350 310, 560 310, 560 328" />
        <path d="M 140 370 C 140 390, 350 390, 350 392" />
        <line x1="350" y1="370" x2="350" y2="392" />
        <path d="M 560 370 C 560 390, 350 390, 350 392" />
      </g>

      {/* START */}
      <circle cx="350" cy="30" r="26" fill="#8c661f" />
      <text
        x="350"
        y="35"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="#fbf7ef"
        letterSpacing="0.1em"
      >
        START
      </text>

      {/* Nodes */}
      {(Object.keys(NODE_POS) as NodeId[]).map((id) => {
        const pos = NODE_POS[id];
        const status = get(id);
        const c = colourFor(id, status);
        return (
          <g key={id}>
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.w}
              height={40}
              rx={6}
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth={status === "running" ? 2.5 : 1.5}
            >
              {status === "running" ? (
                <animate
                  attributeName="opacity"
                  values="1;0.55;1"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              ) : null}
            </rect>
            <text
              x={pos.x + pos.w / 2}
              y={pos.y + 25}
              textAnchor="middle"
              fontSize="14"
              fill={c.text}
              fontWeight={status === "running" || status === "done" ? 600 : 500}
            >
              {NODE_LABELS[id]}
            </text>
          </g>
        );
      })}

      {/* END */}
      <circle cx="350" cy="420" r="26" fill="#8c661f" />
      <text
        x="350"
        y="425"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="#fbf7ef"
        letterSpacing="0.1em"
      >
        END
      </text>
    </svg>
  );
}
