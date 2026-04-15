function scoreText(value: string): number {
  const cyrillic = (value.match(/[А-Яа-яЁё]/g) ?? []).length;
  const bad = (value.match(/[ÐÑРСЃвЂ]/g) ?? []).length;
  return cyrillic - bad * 2;
}

function tryDecode(value: string): string {
  try {
    const esc = (globalThis as { escape?: (input: string) => string }).escape;
    if (!esc) {
      return value;
    }

    return decodeURIComponent(esc(value));
  } catch {
    return value;
  }
}

export function fixText(value: string): string {
  const source = String(value ?? "").replace(/^\uFEFF/, "");
  if (!source) {
    return "";
  }

  const candidates = [
    source,
    tryDecode(source),
    tryDecode(tryDecode(source)),
    tryDecode(tryDecode(tryDecode(source)))
  ];

  let best = candidates[0] ?? source;
  let bestScore = scoreText(best);

  for (const candidate of candidates) {
    const next = String(candidate ?? "");
    const nextScore = scoreText(next);

    if (nextScore > bestScore) {
      best = next;
      bestScore = nextScore;
    }
  }

  return best;
}

export function fixTextList(values: string[]): string[] {
  return values.map((value) => fixText(value));
}
