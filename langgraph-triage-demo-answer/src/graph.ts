import { StateGraph, START, END } from "@langchain/langgraph";
import { TriageState } from "./state.js";
import { classify, extract, validate, decide } from "./nodes.js";

/**
 * Terminal nodes for each branch of the decision. In a production system,
 * autoProcess would call the downstream claim-handling service,
 * queueForReview would call LangGraph's interrupt() to pause the graph
 * pending a reviewer's approval, and reject would log the rejection
 * reason. They are kept minimal here so the demo focuses on the graph
 * shape rather than the side effects.
 */
async function autoProcess() {
  console.log("  → auto-processed");
  return {};
}

async function queueForReview() {
  console.log("  → queued for human review");
  return {};
}

async function reject() {
  console.log("  → rejected");
  return {};
}

export function buildGraph() {
  return new StateGraph(TriageState)
    // Pipeline nodes
    .addNode("classify", classify)
    .addNode("extract", extract)
    .addNode("validate", validate)
    .addNode("decide", decide)
    // Terminal-outcome nodes
    .addNode("autoProcess", autoProcess)
    .addNode("queueForReview", queueForReview)
    .addNode("reject", reject)
    // Linear pipeline
    .addEdge(START, "classify")
    .addEdge("classify", "extract")
    .addEdge("extract", "validate")
    .addEdge("validate", "decide")
    // Conditional branching: route based on the decision field
    .addConditionalEdges("decide", (state) => state.decision, {
      "auto-process": "autoProcess",
      "human-review": "queueForReview",
      "reject": "reject",
    })
    // Each terminal node feeds back into END
    .addEdge("autoProcess", END)
    .addEdge("queueForReview", END)
    .addEdge("reject", END)
    .compile();
}
