import type { TriageStateType } from "./state.js";

/**
 * Mock node implementations for the document-intake triage graph. Each node
 * is a plain async function from the current state to a partial state update.
 *
 * The implementations are deterministic stubs so the demo runs offline,
 * with no API key required. To switch to real model calls, replace the body
 * of classify / extract / validate with a structured-output ChatOpenAI call
 * (or ChatAnthropic, ChatOllama, etc.) and keep the same shape.
 */

export async function classify(state: TriageStateType) {
  const text = state.inputText.toLowerCase();
  let category: TriageStateType["category"] = "unknown";
  if (text.includes("claim") || text.includes("incident")) category = "claim";
  else if (text.includes("question") || text.includes("query")) category = "query";
  else if (text.includes("complaint") || text.includes("disappointed")) category = "complaint";
  return { category };
}

export async function extract(state: TriageStateType) {
  const fields: Record<string, string> = {};
  const policyMatch = state.inputText.match(/policy[:\s#]*([A-Z0-9-]+)/i);
  if (policyMatch) fields.policyNumber = policyMatch[1];
  const dateMatch = state.inputText.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
  if (dateMatch) fields.incidentDate = dateMatch[1];
  return { extracted: fields };
}

export async function validate(state: TriageStateType) {
  const errors: string[] = [];
  if (state.category === "claim") {
    if (!state.extracted.policyNumber) errors.push("Missing policy number");
    if (!state.extracted.incidentDate) errors.push("Missing incident date");
  }
  return { validationErrors: errors };
}

export async function decide(state: TriageStateType) {
  if (state.category === "unknown") return { decision: "reject" as const };
  if (state.validationErrors.length > 0) return { decision: "human-review" as const };
  if (state.category === "claim") return { decision: "auto-process" as const };
  return { decision: "human-review" as const };
}
