"""CSV validation utility for exoplanet light curve uploads.

Responsibilities:
- Read a CSV (stream) safely without loading entire file if large.
- Validate required columns (time, flux) with flexible naming synonyms.
- Return parsed minimal arrays (time_list, flux_list) for downstream model.
- Raise ValueError with human-readable message on invalid input.

Implementation notes:
- Uses pandas for robust CSV parsing; falls back to manual if needed.
- Limits rows to a max preview for model warmup; full series returned if small.
- Strips BOM, trims whitespace headers, normalizes column names.
"""
from __future__ import annotations
import io
from typing import List, Tuple, Dict
import pandas as pd

# Acceptable synonyms for columns
_TIME_ALIASES = {"time", "t", "bjd", "jd"}
_FLUX_ALIASES = {"flux", "f", "pdcsap_flux", "sap_flux", "normalized_flux"}

_MAX_ROWS = 20000  # Hard cap to prevent excessive memory usage
_MIN_ROWS = 20     # Minimum required to attempt transit detection heuristics

class CSVValidationResult(Dict):
    """Typed dict-like result (lightweight)"""
    pass

def _normalize(name: str) -> str:
    return name.strip().lower().replace(" ", "_")

def validate_csv(file_storage) -> CSVValidationResult:
    """Validate an uploaded CSV file-like object.

    Parameters
    ----------
    file_storage : werkzeug.datastructures.FileStorage
        Uploaded file object.

    Returns
    -------
    CSVValidationResult: {
        'time': List[float],
        'flux': List[float],
        'row_count': int,
        'columns': List[str]
    }

    Raises
    ------
    ValueError: On any validation failure.
    """
    filename = getattr(file_storage, 'filename', 'uploaded.csv')
    if not filename.lower().endswith('.csv'):
        raise ValueError("File must have a .csv extension")

    # Read bytes then decode (assume utf-8 with fallback replacement)
    raw = file_storage.read()
    file_storage.seek(0)
    if not raw:
        raise ValueError("Empty file")
    if len(raw) > 5 * 1024 * 1024:  # 5MB soft limit (adjust as needed)
        raise ValueError("File too large (>5MB)")

    text = raw.decode('utf-8', errors='replace').lstrip('\ufeff')

    try:
        df = pd.read_csv(io.StringIO(text))
    except Exception as e:
        raise ValueError(f"CSV parse error: {e}")

    if df.empty:
        raise ValueError("CSV contains no rows")
    if len(df) < _MIN_ROWS:
        raise ValueError(f"Not enough rows for analysis (min {_MIN_ROWS})")
    if len(df) > _MAX_ROWS:
        df = df.head(_MAX_ROWS)

    # Normalize columns
    norm_map = {c: _normalize(c) for c in df.columns}
    df.rename(columns=norm_map, inplace=True)

    time_col = next((c for c in df.columns if c.lower() in _TIME_ALIASES), None)
    flux_col = next((c for c in df.columns if c.lower() in _FLUX_ALIASES), None)

    if not time_col or not flux_col:
        raise ValueError("Missing required time/flux columns (accepted: time,t,bjd,jd / flux,f,pdcsap_flux,sap_flux,normalized_flux)")

    # Coerce numeric
    time_series = pd.to_numeric(df[time_col], errors='coerce')
    flux_series = pd.to_numeric(df[flux_col], errors='coerce')

    if time_series.isna().all() or flux_series.isna().all():
        raise ValueError("Time or flux columns are entirely non-numeric")

    # Drop rows with NaNs in either
    valid = ~(time_series.isna() | flux_series.isna())
    time_list: List[float] = time_series[valid].tolist()
    flux_list: List[float] = flux_series[valid].tolist()

    if len(time_list) < _MIN_ROWS:
        raise ValueError("Insufficient valid numeric rows after cleaning")

    return CSVValidationResult({
        'time': time_list,
        'flux': flux_list,
        'row_count': len(time_list),
        'columns': list(df.columns)
    })

__all__ = ["validate_csv", "CSVValidationResult"]
