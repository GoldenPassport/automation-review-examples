import { buildGraph } from "./graph.js";

/**
 * Entry point. Loops over three sample inputs that exercise each of the
 * three terminal branches:
 *
 *   1. Clean claim with policy and date  → auto-process
 *   2. Malformed claim (missing fields)  → human-review
 *   3. Unknown / off-topic message       → reject
 *
 * The graph runs in streaming mode so each node's update prints as it
 * completes. Useful for tracing flow in development and for adapting to
 * a real UI later.
 */
const graph = buildGraph();

const inputs = [
  // Clean claim
  "Filing a claim for an incident on 12/04/2026 under policy POL-554821.",
  // Malformed claim (missing policy number + date)
  "I want to file a claim, my car was rear-ended yesterday.",
  // Unknown / off-topic
  "Are you hiring? I'd love to work with you.",
];

for (const inputText of inputs) {
  console.log(`\n=== Input: "${inputText.slice(0, 60)}..." ===`);
  for await (const chunk of await graph.stream({ inputText })) {
    for (const [nodeName, update] of Object.entries(chunk)) {
      console.log(`[${nodeName}]`, update);
    }
  }
}
