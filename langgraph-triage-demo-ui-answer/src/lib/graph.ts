import { StateGraph, START, END } from "@langchain/langgraph";
import { TriageState } from "./state";
import { classify, extract, validate, decide } from "./nodes";

/**
 * Same graph shape as the CLI demo's Step 7 / Step 8 final state, with
 * three terminal-outcome nodes that the conditional edge routes into.
 */

async function autoProcess() {
  return {};
}
async function queueForReview() {
  return {};
}
async function reject() {
  return {};
}

export function buildGraph() {
  return new StateGraph(TriageState)
    .addNode("classify", classify)
    .addNode("extract", extract)
    .addNode("validate", validate)
    .addNode("decide", decide)
    .addNode("autoProcess", autoProcess)
    .addNode("queueForReview", queueForReview)
    .addNode("reject", reject)
    .addEdge(START, "classify")
    .addEdge("classify", "extract")
    .addEdge("extract", "validate")
    .addEdge("validate", "decide")
    .addConditionalEdges("decide", (state) => state.decision, {
      "auto-process": "autoProcess",
      "human-review": "queueForReview",
      reject: "reject",
    })
    .addEdge("autoProcess", END)
    .addEdge("queueForReview", END)
    .addEdge("reject", END)
    .compile();
}

/** Ordered list of node ids the UI uses to render the visual flow. */
export const NODE_ORDER = [
  "classify",
  "extract",
  "validate",
  "decide",
  "autoProcess",
  "queueForReview",
  "reject",
] as const;
export type NodeId = (typeof NODE_ORDER)[number];
