import type { TriageStateType } from "../lib/state";

/**
 * Renders the final triage report once the graph has completed. Layout
 * mirrors the structure of the state: category, extracted fields,
 * validation errors, decision. The decision is colour-coded by branch.
 */
export function ReportPanel({
  state,
  filename,
}: {
  state: Partial<TriageStateType>;
  filename: string | null;
}) {
  const decision = state.decision;

  const decisionColour =
    decision === "auto-process"
      ? "#047857"
      : decision === "human-review"
        ? "#b45309"
        : decision === "reject"
          ? "#b91c1c"
          : "#5b6577";

  const decisionLabel =
    decision === "auto-process"
      ? "Auto-process"
      : decision === "human-review"
        ? "Queue for human review"
        : decision === "reject"
          ? "Reject"
          : "Pending";

  return (
    <section
      style={{
        background: "var(--cream-50)",
        border: "1px solid rgba(184, 137, 59, 0.25)",
        borderRadius: 12,
        padding: "1.5rem",
        marginTop: "1.5rem",
      }}
      aria-label="Triage report"
    >
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
        Triage report
      </p>
      <h2
        style={{
          margin: "0.25rem 0 1rem 0",
          color: decisionColour,
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {decisionLabel}
      </h2>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "0.5rem 1.5rem",
          margin: 0,
          fontSize: "0.95rem",
        }}
      >
        {filename ? (
          <>
            <dt style={{ color: "var(--ink-mute)", fontWeight: 600 }}>File</dt>
            <dd style={{ margin: 0 }}>
              <code>{filename}</code>
            </dd>
          </>
        ) : null}

        <dt style={{ color: "var(--ink-mute)", fontWeight: 600 }}>Category</dt>
        <dd style={{ margin: 0 }}>{state.category ?? "—"}</dd>

        <dt style={{ color: "var(--ink-mute)", fontWeight: 600 }}>
          Extracted fields
        </dt>
        <dd style={{ margin: 0 }}>
          {state.extracted && Object.keys(state.extracted).length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {Object.entries(state.extracted).map(([k, v]) => (
                <li key={k}>
                  <strong>{k}:</strong> <code>{v}</code>
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ color: "var(--ink-mute)" }}>(none)</span>
          )}
        </dd>

        <dt style={{ color: "var(--ink-mute)", fontWeight: 600 }}>
          Validation errors
        </dt>
        <dd style={{ margin: 0 }}>
          {state.validationErrors && state.validationErrors.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--red)" }}>
              {state.validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ) : (
            <span style={{ color: "var(--ink-mute)" }}>(none)</span>
          )}
        </dd>
      </dl>
    </section>
  );
}
