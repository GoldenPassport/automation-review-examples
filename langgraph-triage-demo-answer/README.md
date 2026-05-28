# langgraph-triage-demo-answer

The final-state version of the document-intake triage agent built in the LangGraph demo on [goldenpassport.blog](https://goldenpassport.blog/blog/automation-review-langgraph-demo).

If you got stuck mid-tutorial or want to compare your follow-along output against a working reference, this is it. Everything in this folder matches the state of the demo project after Step 8.

## What it does

Classifies an incoming document as a claim, query, complaint, or unknown; extracts policy number and incident date when present; validates the extracted fields against the category's rules; routes the result to one of three terminal branches:

- `auto-process` for clean claims that pass validation
- `human-review` for malformed claims or anything the model is not confident about
- `reject` for off-topic / unknown documents

All model calls are mocked with deterministic stubs, so the demo runs offline without an API key. Swapping to real `ChatOpenAI` (or `ChatAnthropic`, `ChatOllama`, etc.) calls is one change per node body; the graph shape stays the same.

## Run it

```bash
pnpm install
pnpm dev
```

Expected output (three sample inputs, one per branch):

```
=== Input: "Filing a claim for an incident on 12/04/2026 under policy POL-..." ===
[classify] { category: 'claim' }
[extract] { extracted: { policyNumber: 'POL-554821', incidentDate: '12/04/2026' } }
[validate] { validationErrors: [] }
[decide] { decision: 'auto-process' }
[autoProcess] {}
  → auto-processed

=== Input: "I want to file a claim, my car was rear-ended yesterday...." ===
[classify] { category: 'claim' }
[extract] { extracted: {} }
[validate] { validationErrors: [ 'Missing policy number', 'Missing incident date' ] }
[decide] { decision: 'human-review' }
[queueForReview] {}
  → queued for human review

=== Input: "Are you hiring? I'd love to work with you...." ===
[classify] { category: 'unknown' }
[extract] { extracted: {} }
[validate] { validationErrors: [] }
[decide] { decision: 'reject' }
[reject] {}
  → rejected
```

## Project layout

```
langgraph-triage-demo-answer/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── state.ts    Annotation.Root with the typed TriageState
    ├── nodes.ts    classify, extract, validate, decide (mock impls)
    ├── graph.ts    StateGraph wiring + conditional edges + terminal nodes
    └── main.ts     Streaming runner over three sample inputs
```

## Where to take this next

- **Swap the mocks for real model calls.** Replace `classify` and `extract` with `ChatOpenAI` calls using structured output (`withStructuredOutput`). The graph stays identical; only the node bodies change.
- **Add a checkpointer.** Pass `{ checkpointer: new MemorySaver() }` to `.compile()` (or `SqliteSaver` / `PostgresSaver` for production). The graph can then pause inside `queueForReview` with `interrupt()` and resume across processes.
- **Visualise the graph.** `graph.getGraph().drawMermaid()` returns a Mermaid diagram you can paste into any markdown viewer.
- **Wire to a real queue.** Replace the `inputs` array in `main.ts` with messages from SQS / Kafka / a Postgres LISTEN; the rest of the graph does not change.
