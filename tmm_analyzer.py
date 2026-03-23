#!/usr/bin/env python3
"""
TMM Analyzer — General-Purpose Coherence Analysis Library
CSDM Kernel v1.1 · Φ 0.042

Accepts any structured dataset. Computes the five CSDM kernel parameters
via statistical analysis and returns a coherence verdict.

Verdict thresholds:
    C >= 0.974 (Ω boundary)  → COHERENT
    0.90 <= C < 0.974        → DRIFTING
    C < 0.90                 → DECOHERENT
"""

import math
import statistics
from typing import Any

# ── Invariants ────────────────────────────────────────────────────────────────

PHI      = 0.042
OMEGA    = 1.0 - (PHI / 1.61803398875)  # ≈ 0.97404 — coherence ceiling
DRIFT_FLOOR = 0.90

# Kernel parameter weights for composite coherence score
_WEIGHTS = {
    "stability":    0.30,
    "turbulence":   0.25,
    "change_rate":  0.20,
    "completion":   0.15,
    "curvature":    0.10,
}

# ── Data normalisation ────────────────────────────────────────────────────────

def _extract_numerics(data: Any) -> tuple[list[float], int]:
    """
    Extract a flat list of floats from any structured input.
    Returns (values, missing_count).

    Accepts:
      - list / tuple of numbers
      - dict of {key: number} or {key: list}
      - list of dicts (table rows) — flattens numeric values
      - nested lists (flattens one level)
      - CSV string ("1,2,3,4")
    """
    values: list[float] = []
    missing = 0

    def _try_float(v) -> float | None:
        try:
            f = float(v)
            return None if math.isnan(f) or math.isinf(f) else f
        except (TypeError, ValueError):
            return None

    def _walk(obj):
        nonlocal missing
        if isinstance(obj, (int, float)):
            v = _try_float(obj)
            if v is not None:
                values.append(v)
            else:
                missing += 1
        elif isinstance(obj, str):
            # Try CSV
            parts = obj.split(",")
            if len(parts) > 1:
                for p in parts:
                    v = _try_float(p.strip())
                    if v is not None:
                        values.append(v)
                    else:
                        missing += 1
            else:
                v = _try_float(obj.strip())
                if v is not None:
                    values.append(v)
                else:
                    missing += 1
        elif isinstance(obj, dict):
            for val in obj.values():
                _walk(val)
        elif isinstance(obj, (list, tuple)):
            for item in obj:
                _walk(item)
        elif obj is None:
            missing += 1

    _walk(data)
    return values, missing


# ── Kernel parameter computations ─────────────────────────────────────────────

def _compute_stability(values: list[float]) -> float:
    """
    Φζ — Stability.
    Based on coefficient of variation (normalised std/mean).
    Low spread relative to mean = high stability.
    """
    if len(values) < 2:
        return 1.0
    mean = statistics.mean(values)
    if mean == 0:
        # Use absolute std normalised to range
        data_range = max(values) - min(values) if len(values) > 1 else 1.0
        if data_range == 0:
            return 1.0
        return max(0.0, 1.0 - (statistics.stdev(values) / data_range))
    cv = statistics.stdev(values) / abs(mean)
    # CV of 0 → stability 1.0; CV of 1.0 → stability ≈ 0.0
    return max(0.0, min(1.0, 1.0 - min(cv, 1.0)))


def _compute_turbulence(values: list[float]) -> float:
    """
    Ψχ — Turbulence.
    Based on outlier fraction via IQR method.
    Returns 0.0 (calm) to 1.0 (chaotic).
    """
    if len(values) < 4:
        return 0.0
    sorted_v = sorted(values)
    n = len(sorted_v)
    q1 = sorted_v[n // 4]
    q3 = sorted_v[(3 * n) // 4]
    iqr = q3 - q1
    if iqr == 0:
        return 0.0
    fence_lo = q1 - 1.5 * iqr
    fence_hi = q3 + 1.5 * iqr
    outliers = [v for v in values if v < fence_lo or v > fence_hi]
    # Weight by both count and severity
    outlier_fraction = len(outliers) / len(values)
    if outliers:
        mean = statistics.mean(values)
        severity = statistics.mean(abs(v - mean) / (iqr + 1e-9) for v in outliers)
        severity_factor = min(1.0, severity / 3.0)  # normalise: 3× IQR = max severity
    else:
        severity_factor = 0.0
    return min(1.0, outlier_fraction * 0.6 + severity_factor * 0.4)


def _compute_change_rate(values: list[float]) -> float:
    """
    ΔΓ — Change Rate (first derivative).
    Based on mean absolute step-change relative to overall range.
    Returns 0.0 (static) to 1.0 (violently changing).
    """
    if len(values) < 2:
        return 0.0
    data_range = max(values) - min(values)
    if data_range == 0:
        return 0.0
    deltas = [abs(values[i+1] - values[i]) for i in range(len(values) - 1)]
    mean_delta = statistics.mean(deltas)
    return min(1.0, mean_delta / data_range)


def _compute_completion(total_slots: int, missing: int) -> float:
    """
    ΩQ — Completion.
    Based on data density: fraction of expected values that are present.
    """
    if total_slots == 0:
        return 1.0
    return max(0.0, 1.0 - (missing / total_slots))


def _compute_curvature(values: list[float]) -> float:
    """
    ΛC — Curvature (second derivative).
    Based on mean signed second-order difference, normalised to range.
    Returns -1.0 (decelerating) to +1.0 (accelerating).
    """
    if len(values) < 3:
        return 0.0
    data_range = max(values) - min(values)
    if data_range == 0:
        return 0.0
    second_derivs = [values[i+2] - 2*values[i+1] + values[i] for i in range(len(values) - 2)]
    mean_curve = statistics.mean(second_derivs)
    return max(-1.0, min(1.0, mean_curve / data_range))


# ── Coherence formula ─────────────────────────────────────────────────────────

def _coherence_from_kernel(
    stability: float,
    turbulence: float,
    change_rate: float,
    completion: float,
    curvature: float,
) -> float:
    """
    Compose five kernel parameters into a single coherence score [0.0, 1.0].

    Components that contribute positively (higher = better):
        stability, completion, (1 - |curvature|)
    Components that contribute negatively (lower = better):
        turbulence, change_rate
    """
    w = _WEIGHTS
    score = (
        stability       * w["stability"]
      + (1 - turbulence)  * w["turbulence"]
      + (1 - change_rate) * w["change_rate"]
      + completion        * w["completion"]
      + (1 - abs(curvature)) * w["curvature"]
    )
    return max(0.0, min(1.0, score / sum(w.values())))


# ── Verdict ───────────────────────────────────────────────────────────────────

def _verdict(c: float) -> str:
    if c >= OMEGA:
        return "COHERENT"
    elif c >= DRIFT_FLOOR:
        return "DRIFTING"
    else:
        return "DECOHERENT"


# ── Plain-language analysis ───────────────────────────────────────────────────

def _generate_analysis(
    context: str,
    verdict: str,
    c: float,
    stability: float,
    turbulence: float,
    change_rate: float,
    completion: float,
    curvature: float,
    n_values: int,
    missing: int,
) -> str:
    lines = []

    label = context.strip() or "dataset"

    if verdict == "COHERENT":
        lines.append(
            f"The {label} holds. Coherence score {c:.4f} clears the Ω boundary "
            f"({OMEGA:.4f}). The structure is stable and internally consistent."
        )
    elif verdict == "DRIFTING":
        lines.append(
            f"The {label} is drifting. Coherence score {c:.4f} falls between the "
            f"drift floor (0.90) and the Ω boundary ({OMEGA:.4f}). "
            f"The structure is intact but under stress."
        )
    else:
        lines.append(
            f"The {label} is decoherent. Coherence score {c:.4f} is below the "
            f"drift floor (0.90). The structure is not holding."
        )

    # Kernel commentary
    if stability < 0.70:
        lines.append(
            f"Stability (Φζ={stability:.3f}): High variance detected. The spread of values "
            f"relative to their mean is wide — the dataset lacks a consistent centre."
        )
    elif stability > 0.95:
        lines.append(
            f"Stability (Φζ={stability:.3f}): The dataset is tightly bounded around its mean. "
            f"Variance is within acceptable limits."
        )
    else:
        lines.append(
            f"Stability (Φζ={stability:.3f}): Moderate variance. The dataset shows some spread "
            f"but remains within manageable bounds."
        )

    if turbulence > 0.30:
        lines.append(
            f"Turbulence (Ψχ={turbulence:.3f}): Significant outlier activity. Anomalous values "
            f"are present and pulling the structure out of equilibrium."
        )
    elif turbulence > 0.10:
        lines.append(
            f"Turbulence (Ψχ={turbulence:.3f}): Mild outlier presence. Noise is detectable "
            f"but not yet destabilising."
        )
    else:
        lines.append(
            f"Turbulence (Ψχ={turbulence:.3f}): Signal is clean. Outlier activity is minimal."
        )

    if change_rate > 0.40:
        lines.append(
            f"Change Rate (ΔΓ={change_rate:.3f}): High rate of change between adjacent values. "
            f"The system is moving fast — sustainability depends on directional consistency."
        )
    elif change_rate > 0.15:
        lines.append(
            f"Change Rate (ΔΓ={change_rate:.3f}): Moderate momentum. The dataset is evolving "
            f"but not erratically."
        )
    else:
        lines.append(
            f"Change Rate (ΔΓ={change_rate:.3f}): Low velocity. The dataset is near-static "
            f"or smoothly trending."
        )

    if completion < 0.85:
        lines.append(
            f"Completion (ΩQ={completion:.3f}): Data density is below the 0.85 threshold. "
            f"{missing} missing or invalid values detected out of {n_values + missing} expected slots. "
            f"Gaps reduce resolution."
        )
    else:
        lines.append(
            f"Completion (ΩQ={completion:.3f}): Data is dense. "
            f"{'No missing values detected.' if missing == 0 else f'{missing} minor gaps detected.'}"
        )

    if abs(curvature) > 0.30:
        direction = "accelerating" if curvature > 0 else "decelerating"
        lines.append(
            f"Curvature (ΛC={curvature:.3f}): Strong {direction} trend. "
            f"The rate of change itself is changing — the trajectory is non-linear."
        )
    elif abs(curvature) > 0.10:
        lines.append(
            f"Curvature (ΛC={curvature:.3f}): Mild curvature. The trend is bending "
            f"slightly but has not yet inverted."
        )
    else:
        lines.append(
            f"Curvature (ΛC={curvature:.3f}): Trajectory is approximately linear. "
            f"No significant acceleration or deceleration detected."
        )

    return " | ".join(lines)


# ── Public interface ──────────────────────────────────────────────────────────

def analyze(data: Any, context: str = "") -> dict:
    """
    Compute TMM coherence for any structured dataset.

    Args:
        data:    Any structured input — list, dict, nested list, CSV string, etc.
        context: Human-readable description of what the data represents.

    Returns:
        {
          "verdict":          "COHERENT" | "DRIFTING" | "DECOHERENT",
          "coherence_score":  float  (0.0 – 1.0),
          "kernel": {
            "stability":    float  (0.0 – 1.0),
            "turbulence":   float  (0.0 – 1.0),
            "change_rate":  float  (0.0 – 1.0),
            "completion":   float  (0.0 – 1.0),
            "curvature":    float  (-1.0 – 1.0),
          },
          "analysis":   str,
          "invariant":  "0.042",
          "n_values":   int,
          "n_missing":  int,
        }
    """
    values, missing = _extract_numerics(data)
    total_slots = len(values) + missing

    if not values:
        return {
            "verdict":        "DECOHERENT",
            "coherence_score": 0.0,
            "kernel": {
                "stability":   0.0,
                "turbulence":  1.0,
                "change_rate": 0.0,
                "completion":  0.0,
                "curvature":   0.0,
            },
            "analysis":  "No numeric values could be extracted from the dataset. "
                         "The structure is empty or entirely non-numeric. Coherence cannot be computed.",
            "invariant": "0.042",
            "n_values":  0,
            "n_missing": missing,
        }

    stability   = _compute_stability(values)
    turbulence  = _compute_turbulence(values)
    change_rate = _compute_change_rate(values)
    completion  = _compute_completion(total_slots, missing)
    curvature   = _compute_curvature(values)

    c       = _coherence_from_kernel(stability, turbulence, change_rate, completion, curvature)
    verdict = _verdict(c)

    analysis = _generate_analysis(
        context, verdict, c,
        stability, turbulence, change_rate, completion, curvature,
        len(values), missing,
    )

    return {
        "verdict":         verdict,
        "coherence_score": round(c, 6),
        "kernel": {
            "stability":   round(stability,   4),
            "turbulence":  round(turbulence,  4),
            "change_rate": round(change_rate, 4),
            "completion":  round(completion,  4),
            "curvature":   round(curvature,   4),
        },
        "analysis":  analysis,
        "invariant": "0.042",
        "n_values":  len(values),
        "n_missing": missing,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    import json
    import sys

    ap = argparse.ArgumentParser(description="TMM Coherence Analyzer — CSDM Kernel v1.1")
    ap.add_argument("data",    help="JSON-encoded dataset (array, object, or string)")
    ap.add_argument("--context", default="", help="Description of the dataset")
    args = ap.parse_args()

    try:
        raw = json.loads(args.data)
    except json.JSONDecodeError:
        raw = args.data  # treat as CSV string

    result = analyze(raw, context=args.context)
    print(json.dumps(result, indent=2))
