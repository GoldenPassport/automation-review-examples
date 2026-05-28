import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import {
  GraphView,
  type NodeStatus,
  type NodeStatusMap,
} from "./components/GraphView";
import { ReportPanel } from "./components/ReportPanel";
import { buildGraph, NODE_ORDER, type NodeId } from "./lib/graph";
import type { TriageStateType } from "./lib/state";

/**
 * Top-level UI. Three regions:
 *   1. File upload (left column)
 *   2. Graph view (right column, sticky on wide screens)
 *   3. Report panel (below the upload, populated once the graph finishes)
 *
 * When the user uploads a .docx, the parsed text is fed into a fresh
 * StateGraph. We stream the graph and update per-node status as chunks
 * arrive, so the graph view animates as the model thinks.
 */
export function App() {
  const [statuses, setStatuses] = useState<NodeStatusMap>({});
  const [state, setState] = useState<Partial<TriageStateType>>({});
  const [filename, setFilename] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStatuses({});
    setState({});
    setError(null);
  };

  const runGraph = async (text: string, name: string) => {
    reset();
    setFilename(name);
    setRunning(true);

    // Mark all pipeline nodes as idle; the three terminal branches
    // start as "skipped" so the chosen one stands out when it runs.
    const initial: NodeStatusMap = {
      classify: "idle",
      extract: "idle",
      validate: "idle",
      decide: "idle",
      autoProcess: "skipped",
      queueForReview: "skipped",
      reject: "skipped",
    };
    setStatuses(initial);

    try {
      const graph = buildGraph();
      let current: NodeStatusMap = { ...initial };
      let merged: Partial<TriageStateType> = { inputText: text };

      // Walk through pipeline nodes one by one so the UI can show each
      // turning "running" before the chunk arrives. We could rely on
      // graph.stream() entirely, but pre-flagging gives a nicer animation.
      const stream = await graph.stream({ inputText: text });
      for await (const chunk of stream) {
        for (const [nodeName, update] of Object.entries(chunk)) {
          const id = nodeName as NodeId;
          // Mark this node as running first (one beat of animation)
          current = { ...current, [id]: "running" as NodeStatus };
          setStatuses(current);
          await new Promise((r) => setTimeout(r, 150));

          // Then mark as done and merge the partial update into state
          current = { ...current, [id]: "done" as NodeStatus };
          setStatuses(current);
          merged = { ...merged, ...(update as Partial<TriageStateType>) };
          setState(merged);
        }
      }

      // After the graph finishes, mark untouched terminal branches as
      // "skipped" if they were never visited, leaving the chosen branch
      // in its "done" state.
      const finalStatuses: NodeStatusMap = { ...current };
      for (const id of NODE_ORDER) {
        if (finalStatuses[id] === undefined) finalStatuses[id] = "skipped";
      }
      setStatuses(finalStatuses);
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.name}: ${e.message}. Is Ollama running on localhost:11434 and has llama3.2:3b been pulled?`
          : "Unknown error running the graph.",
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--gold-deep)",
            fontWeight: 600,
          }}
        >
          LangGraph triage demo
        </p>
        <h1
          style={{
            margin: "0.3rem 0 0.5rem 0",
            color: "var(--ink)",
            fontSize: "2rem",
          }}
        >
          Document intake
        </h1>
        <p style={{ margin: 0, color: "var(--ink-soft)" }}>
          Upload a .docx; watch the graph route it.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "2rem",
        }}
      >
        <div>
          <FileUpload onText={runGraph} disabled={running} />
          {error ? (
            <p
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "rgba(185, 28, 28, 0.08)",
                border: "1px solid rgba(185, 28, 28, 0.3)",
                borderRadius: 8,
                color: "var(--red)",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          ) : null}
          {state.decision ? (
            <ReportPanel state={state} filename={filename} />
          ) : null}
        </div>
        <div>
          <p
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold-deep)",
              fontWeight: 600,
            }}
          >
            Workflow
          </p>
          <GraphView statuses={statuses} />
        </div>
      </div>
    </main>
  );
}
