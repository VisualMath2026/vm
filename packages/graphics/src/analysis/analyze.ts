import type { Expr } from "./ast.js";
import { derivativeOf } from "./differentiate.js";
import { evaluateExpr } from "./evaluate.js";
import { findRootsOnInterval } from "./roots.js";

export interface SamplePoint {
  x: number;
  y: number;
}

export interface AnalysisPoint {
  x: number;
  y: number;
}

export interface FunctionAnalysisResult {
  samples: SamplePoint[];
  zeros: number[];
  discontinuities: number[];
  criticalPoints: AnalysisPoint[];
  minimum: AnalysisPoint | null;
  maximum: AnalysisPoint | null;
  range: { minY: number; maxY: number } | null;
}

function uniqueRounded(values: number[], digits = 4): number[] {
  const out: number[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const rounded = Number(value.toFixed(digits));
    const key = rounded.toFixed(digits);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(rounded);
    }
  }

  return out;
}

export function sampleExprOnInterval(
  expr: Expr,
  xMin: number,
  xMax: number,
  samples = 2400
): { points: SamplePoint[]; discontinuities: number[] } {
  const points: SamplePoint[] = [];
  const discontinuities: number[] = [];
  const step = (xMax - xMin) / samples;

  for (let i = 0; i <= samples; i += 1) {
    const x = xMin + i * step;
    const y = evaluateExpr(expr, x);

    if (Number.isFinite(y)) {
      points.push({ x, y });
    } else {
      discontinuities.push(x);
    }
  }

  return {
    points,
    discontinuities: uniqueRounded(discontinuities, 3),
  };
}

export function analyzeExprOnInterval(
  expr: Expr,
  xMin: number,
  xMax: number
): FunctionAnalysisResult {
  const { points, discontinuities } = sampleExprOnInterval(expr, xMin, xMax, 2600);

  let minimum: AnalysisPoint | null = null;
  let maximum: AnalysisPoint | null = null;

  for (const point of points) {
    if (!minimum || point.y < minimum.y) {
      minimum = { x: point.x, y: point.y };
    }
    if (!maximum || point.y > maximum.y) {
      maximum = { x: point.x, y: point.y };
    }
  }

  const derivative = derivativeOf(expr);
  const dfn = (x: number) => evaluateExpr(derivative, x);
  const criticalXs = findRootsOnInterval(dfn, xMin, xMax, {
    samples: 2500,
    tolerance: 1e-5,
    maxIterations: 80,
  });

  const criticalPoints: AnalysisPoint[] = criticalXs
    .map((x) => ({ x, y: evaluateExpr(expr, x) }))
    .filter((point) => Number.isFinite(point.y));

  const fn = (x: number) => evaluateExpr(expr, x);
  const zeros = findRootsOnInterval(fn, xMin, xMax, {
    samples: 2500,
    tolerance: 1e-5,
    maxIterations: 80,
  });

  const candidates: AnalysisPoint[] = [
    ...criticalPoints,
    { x: xMin, y: fn(xMin) },
    { x: xMax, y: fn(xMax) },
  ].filter((point) => Number.isFinite(point.y));

  for (const point of candidates) {
    if (!minimum || point.y < minimum.y) {
      minimum = point;
    }
    if (!maximum || point.y > maximum.y) {
      maximum = point;
    }
  }

  return {
    samples: points,
    zeros,
    discontinuities,
    criticalPoints,
    minimum,
    maximum,
    range:
      minimum && maximum
        ? { minY: minimum.y, maxY: maximum.y }
        : null,
  };
}
