import { ChatOllama } from "@langchain/ollama";
import type { TriageStateType, Category } from "./state";

/**
 * Node implementations that call Ollama via the Vite proxy. Each node
 * prompts the model with a tight task and parses the response into the
 * shape the graph expects.
 *
 * Small models (3B-class) are not always reliable with full JSON-schema
 * structured output, so we use plain text prompts with strict format
 * instructions and parse defensively.
 */

const MODEL_NAME = "llama3.2:3b";

// baseUrl must be an absolute URL with an origin — @langchain/ollama passes
// it through to the underlying Ollama JS client, which expects a full host.
// We use the current page origin plus the /api/ollama path, so the request
// hits the Vite dev server, which then proxies to localhost:11434 (config
// in vite.config.ts).
const baseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/ollama`
    : "http://localhost:11434";

const model = new ChatOllama({
  baseUrl,
  model: MODEL_NAME,
  temperature: 0,
});

const CATEGORIES: readonly Category[] = ["claim", "query", "complaint", "unknown"] as const;

export async function classify(state: TriageStateType): Promise<Partial<TriageStateType>> {
  const prompt = `You are a document triage classifier for an insurance company.

Classify the following document into exactly one of these categories:
- claim: customer is reporting a new insurance claim
- query: customer is asking a question about their policy
- complaint: customer is expressing dissatisfaction
- unknown: anything else (job applications, spam, off-topic)

Respond with ONLY one of these four words, lowercase, nothing else.

Document:
"""
${state.inputText}
"""

Category:`;

  const response = await model.invoke(prompt);
  const text = response.content.toString().trim().toLowerCase();

  // Defensive parse: pick the first category word that appears in the
  // response. Falls back to "unknown" if the model emits garbage.
  const category: Category =
    CATEGORIES.find((c) => text.includes(c)) ?? "unknown";

  return { category };
}

export async function extract(state: TriageStateType): Promise<Partial<TriageStateType>> {
  // Only extract structured fields for claims; other categories have no
  // canonical schema in this demo.
  if (state.category !== "claim") return { extracted: {} };

  const prompt = `You are an information extractor. From the document below, extract these fields if present:
- policyNumber: a policy reference (e.g. "POL-554821")
- incidentDate: a date in dd/mm/yyyy format

Respond in this exact format (use "N/A" if a field is not present):
policyNumber: <value>
incidentDate: <value>

Document:
"""
${state.inputText}
"""`;

  const response = await model.invoke(prompt);
  const text = response.content.toString();

  const fields: Record<string, string> = {};

  // Match the whole rest of the line for the value, then test against
  // "N/A" / "none" / "missing" / empty before accepting. The old regex
  // greedily took [A-Z0-9-]+ which stopped at the slash in "N/A" and
  // kept the leading "N", then the N/A filter missed it.
  const policyMatch = text.match(/policyNumber:\s*([^\n\r]+)/i);
  if (policyMatch) {
    const raw = policyMatch[1].trim();
    if (raw && !/^(n\/?a|none|missing|null)$/i.test(raw)) {
      // Pull a clean token: letters, digits, dashes only.
      const tokenMatch = raw.match(/^[A-Z0-9-]+/i);
      if (tokenMatch) fields.policyNumber = tokenMatch[0];
    }
  }

  const dateMatch = text.match(/incidentDate:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateMatch) {
    fields.incidentDate = dateMatch[1];
  }

  return { extracted: fields };
}

export async function validate(state: TriageStateType): Promise<Partial<TriageStateType>> {
  // Validation is deterministic, no model call needed.
  const errors: string[] = [];
  if (state.category === "claim") {
    if (!state.extracted.policyNumber) errors.push("Missing policy number");
    if (!state.extracted.incidentDate) errors.push("Missing incident date");
  }
  return { validationErrors: errors };
}

export async function decide(state: TriageStateType): Promise<Partial<TriageStateType>> {
  // Routing is deterministic too. The model only judges category and
  // extracts fields; everything else is rule-based for auditability.
  if (state.category === "unknown") return { decision: "reject" as const };
  if (state.validationErrors.length > 0) return { decision: "human-review" as const };
  if (state.category === "claim") return { decision: "auto-process" as const };
  return { decision: "human-review" as const };
}
