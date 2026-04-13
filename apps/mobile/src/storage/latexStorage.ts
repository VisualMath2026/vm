export type LatexDocumentState = {
  title: string;
  source: string;
  authorName: string;
  updatedAt: string;
};

const STORAGE_KEY = "vm_mobile_latex_document_v1";

const DEFAULT_LATEX_SOURCE = String.raw`Рассмотрим функцию $f(x) = x^2$.

Её производная:
$$
f'(x) = \lim_{h \to 0}\frac{(x+h)^2 - x^2}{h} = 2x
$$

Ряд Тейлора для $e^x$:
$$
e^x = \sum_{n=0}^{\infty}\frac{x^n}{n!}
$$

Интеграл:
$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$`;

function getStorage(): Storage | null {
  try {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function createDefaultLatexDocument(authorName = "VisualMath"): LatexDocumentState {
  return {
    title: "LaTeX-конспект",
    source: DEFAULT_LATEX_SOURCE,
    authorName,
    updatedAt: new Date().toISOString()
  };
}

export function readLatexDocument(): LatexDocumentState {
  const storage = getStorage();

  if (!storage) {
    return createDefaultLatexDocument();
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultLatexDocument();
    }

    const parsed = JSON.parse(raw) as Partial<LatexDocumentState>;

    return {
      title: typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title
        : "LaTeX-конспект",
      source: typeof parsed.source === "string" && parsed.source.trim()
        ? parsed.source
        : DEFAULT_LATEX_SOURCE,
      authorName: typeof parsed.authorName === "string" && parsed.authorName.trim()
        ? parsed.authorName
        : "VisualMath",
      updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt.trim()
        ? parsed.updatedAt
        : new Date().toISOString()
    };
  } catch {
    return createDefaultLatexDocument();
  }
}

export async function writeLatexDocument(document: LatexDocumentState): Promise<void> {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(document));
}
