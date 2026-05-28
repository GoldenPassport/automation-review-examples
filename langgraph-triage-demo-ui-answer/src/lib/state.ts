import { Annotation } from "@langchain/langgraph";

/**
 * Shared state for the triage graph. Same shape as the CLI demo's state
 * (see langgraph-triage-demo-answer/src/state.ts) so the graph can be
 * portable between runtimes.
 */
export const TriageState = Annotation.Root({
  inputText: Annotation<string>(),
  category: Annotation<"claim" | "query" | "complaint" | "unknown">(),
  extracted: Annotation<Record<string, string>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),
  validationErrors: Annotation<string[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
  decision: Annotation<"auto-process" | "human-review" | "reject">(),
});

export type TriageStateType = typeof TriageState.State;

export type Decision = TriageStateType["decision"];
export type Category = TriageStateType["category"];
