import { useState, useRef } from "react";
import mammoth from "mammoth";

/**
 * .docx file upload. Reads the file with mammoth and hands the extracted
 * plain text to the parent via onText().
 */
export function FileUpload({
  onText,
  disabled,
}: {
  onText: (text: string, filename: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFilename(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      const text = value.trim();
      if (!text) {
        setError("That .docx file appears to be empty.");
        return;
      }
      onText(text, file.name);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Could not read that file: ${e.message}`
          : "Could not read that file.",
      );
    }
  };

  return (
    <div
      style={{
        border: "2px dashed rgba(184, 137, 59, 0.4)",
        borderRadius: 12,
        padding: "2rem",
        background: "var(--cream-50)",
        textAlign: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        style={{ display: "none" }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        style={{
          background: "var(--ink)",
          color: "var(--cream)",
          border: "none",
          borderRadius: 999,
          padding: "0.75rem 1.5rem",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        Choose .docx file
      </button>
      <p
        style={{
          margin: "0.75rem 0 0 0",
          fontSize: "0.85rem",
          color: "var(--ink-mute)",
        }}
      >
        Samples in <code>samples/</code> after running{" "}
        <code>pnpm generate-samples</code>
      </p>
      {filename ? (
        <p
          style={{
            margin: "0.75rem 0 0 0",
            fontSize: "0.85rem",
            color: "var(--ink-soft)",
          }}
        >
          Selected: <strong>{filename}</strong>
        </p>
      ) : null}
      {error ? (
        <p
          style={{
            margin: "0.75rem 0 0 0",
            fontSize: "0.85rem",
            color: "var(--red)",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
