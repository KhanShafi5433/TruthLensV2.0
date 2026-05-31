import React from "react";
import { SuspiciousPhrase } from "../services/analysisTypes";

type Segment = { text: string; highlight: boolean };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSegments(content: string, phrases: SuspiciousPhrase[]): Segment[] {
  if (!phrases.length) {
    return [{ text: content, highlight: false }];
  }

  const matches: { start: number; end: number }[] = [];

  for (const phrase of phrases) {
    if (!phrase.text.trim()) continue;
    const re = new RegExp(escapeRegex(phrase.text.trim()), "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length });
      if (match.index === re.lastIndex) re.lastIndex++;
    }
  }

  if (!matches.length) {
    return [{ text: content, highlight: false }];
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: { start: number; end: number }[] = [];
  for (const m of matches) {
    const last = merged[merged.length - 1];
    if (!last || m.start >= last.end) {
      merged.push({ ...m });
    } else if (m.end > last.end) {
      last.end = m.end;
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;

  for (const m of merged) {
    if (m.start > cursor) {
      segments.push({ text: content.slice(cursor, m.start), highlight: false });
    }
    segments.push({ text: content.slice(m.start, m.end), highlight: true });
    cursor = m.end;
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), highlight: false });
  }

  return segments;
}

export function HighlightedMessage({
  content,
  phrases,
  className = "",
}: {
  content: string;
  phrases: SuspiciousPhrase[];
  className?: string;
}) {
  const segments = buildSegments(content, phrases);

  return (
    <p className={className}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            className="bg-amber-500/25 text-amber-100 border-b border-amber-500/50 rounded-sm px-0.5 not-italic"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </p>
  );
}
