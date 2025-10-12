''' Very large helper function to parse every possible date format, ultimate validation '''
from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, date, timezone
import re

try:
    # pip install python-dateutil
    from dateutil import parser
except Exception as e:
    raise RuntimeError("Install python-dateutil: pip install python-dateutil") from e


@dataclass(frozen=True)
class Candidate:
    iso: str
    year: int
    month: int
    day: int
    source: str                    # e.g., "strftime:%m/%d/%Y" or "dateutil(dayfirst=True)"
    assumptions: Dict[str, Any]    # e.g., {"dayfirst": True, "yearfirst": False}
    valid: bool
    reasons: List[str]

def _to_iso(d: date) -> str:
    return f"{d.year:04d}-{d.month:02d}-{d.day:02d}"

def _age_on(d: date, ref: date) -> int:
    return ref.year - d.year - ((ref.month, ref.day) < (d.month, d.day))

def _validate(d: date, context: str, now: date) -> Tuple[bool, List[str]]:
    """
    Basic sanity checks. Context-aware:
      - 'dob' (default): not in future; age 0..120; year>=1900.
      - 'generic': year in 1600..3000.
    """
    reasons = []
    if context == "dob":
        if d > now:
            reasons.append("future date not allowed for DoB")
        if d.year < 1900:
            reasons.append("year too early for DoB (<1900)")
        age = _age_on(d, now)
        if age < 0 or age > 120:
            reasons.append(f"age out of bounds for DoB ({age})")
    else:
        if d.year < 1600 or d.year > 3000:
            reasons.append("year out of generic bounds (1600..3000)")
    return (len(reasons) == 0, reasons)

def _try_strptime(s: str, fmt: str) -> Optional[date]:
    try:
        return datetime.strptime(s, fmt).date()
    except Exception:
        return None

def _epoch_candidate(s: str) -> Optional[date]:
    # 10-digit seconds or 13-digit milliseconds since epoch
    if re.fullmatch(r"\d{10}", s):
        ts = int(s)
        return datetime.fromtimestamp(ts, tz=timezone.utc).date()
    if re.fullmatch(r"\d{13}", s):
        ts = int(s) / 1000.0
        return datetime.fromtimestamp(ts, tz=timezone.utc).date()
    return None

# Common explicit formats to try (covers most “malformatted” inputs quickly)
_EXPLICIT_FORMATS = [
    "%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d",
    "%m/%d/%Y", "%m-%d-%Y", "%m.%d.%Y",
    "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
    "%b %d %Y", "%d %b %Y", "%B %d %Y", "%d %B %Y",
    "%m/%d/%y", "%d/%m/%y", "%y-%m-%d", "%y/%m/%d",
]

def parse_date_all(
    s: str,
    *,
    context: str = "dob",               # 'dob' or 'generic'
    prefer: str = "US",                 # tie-breaker if ambiguous: 'US' -> month/day, 'EU' -> day/month
    two_digit_year_pivot: int = 69      # for explicit %y formats; 69 -> 1969/2069 behavior like strptime
) -> Dict[str, Any]:
    """
    Return ALL plausible interpretations of 's' as dates, with validation info.
    Does NOT mutate input; does NOT pick one unless unambiguous.
    """
    raw = s.strip()
    now = datetime.utcnow().date()
    seen = set()  # (year,month,day)
    candidates: List[Candidate] = []

    # 0) Epoch timestamps
    d0 = _epoch_candidate(raw)
    if d0:
        ok, reasons = _validate(d0, context, now)
        key = (d0.year, d0.month, d0.day)
        if key not in seen:
            seen.add(key)
            candidates.append(Candidate(
                iso=_to_iso(d0), year=d0.year, month=d0.month, day=d0.day,
                source="epoch", assumptions={}, valid=ok, reasons=reasons
            ))

    # 1) Explicit strptime formats
    # For %y behavior, we temporarily override default pivot by pre-normalizing when possible.
    for fmt in _EXPLICIT_FORMATS:
        d1 = _try_strptime(raw, fmt)
        if d1:
            ok, reasons = _validate(d1, context, now)
            key = (d1.year, d1.month, d1.day)
            if key not in seen:
                seen.add(key)
                candidates.append(Candidate(
                    iso=_to_iso(d1), year=d1.year, month=d1.month, day=d1.day,
                    source=f"strftime:{fmt}", assumptions={}, valid=ok, reasons=reasons
                ))

    # 2) Heuristic parser (dateutil) with combinations
    for dayfirst in (False, True):
        for yearfirst in (False, True):
            try:
                dt = parser.parse(raw, dayfirst=dayfirst, yearfirst=yearfirst, fuzzy=True)
                d = dt.date()
                ok, reasons = _validate(d, context, now)
                key = (d.year, d.month, d.day)
                if key not in seen:
                    seen.add(key)
                    candidates.append(Candidate(
                        iso=_to_iso(d), year=d.year, month=d.month, day=d.day,
                        source="dateutil", assumptions={"dayfirst": dayfirst, "yearfirst": yearfirst},
                        valid=ok, reasons=reasons
                    ))
            except Exception:
                pass

    # 3) Sort: valid first, then by absolute distance from today (closer is better), then ISO
    def _score(c: Candidate) -> Tuple[int, int, str]:
        d = date(c.year, c.month, c.day)
        dist = abs((d - now).days)
        return (0 if c.valid else 1, dist, c.iso)

    candidates.sort(key=_score)

    # Ambiguity detection (e.g., "01/02/03")
    unique_isos = [c.iso for c in candidates]
    ambiguous = len(set(unique_isos)) > 1

    # Preferred choice if you need one
    best: Optional[str] = None
    if candidates:
        # Start with the top-scoring candidate
        best_c = candidates[0]
        # If ambiguous between US/EU patterns and both valid, prefer requested style
        if ambiguous:
            pref_dayfirst = (prefer.upper() == "EU")
            prefereds = [c for c in candidates if c.assumptions.get("dayfirst") == pref_dayfirst and c.valid]
            if prefereds:
                best_c = prefereds[0]
        best = best_c.iso

    return {
        "input": raw,
        "context": context,
        "ambiguous": ambiguous,
        "best": best,
        "candidates": [asdict(c) for c in candidates],
    }
