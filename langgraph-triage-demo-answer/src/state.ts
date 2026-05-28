import { Annotation } from "@langchain/langgraph";

/**
 * The shared state that flows through every node in the triage graph.
 *
 * Each Annotation slot is typed, and the optional reducers control how
 * concurrent / sequential writes merge:
 *   - extracted: merges new fields into the object (key-wise).
 *   - validationErrors: appends new errors to the array.
 *   - The rest replace the previous value.
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
