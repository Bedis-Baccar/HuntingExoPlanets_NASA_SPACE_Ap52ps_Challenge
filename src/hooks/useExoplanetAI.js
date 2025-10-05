import { useState, useCallback, useRef } from 'react';

/**
 * useExoplanetAI
 * Hook to POST a mission + CSV file to FastAPI endpoint: http://localhost:8000/predict
 * Returns normalized structure: { candidates: [], light_curve: [...], mission, fileName }
 * Mock mode: set window.USE_MOCK = true (runtime) to bypass network.
 * Methods:
 *  - run({ mission, file }) : Promise<data|null>
 *  - abort(): cancels inflight fetch
 *  - reset(): clears state
 */

// Detect mock mode (can be toggled at runtime via window.USE_MOCK = true)
const USE_MOCK = typeof window !== 'undefined' && window.USE_MOCK === true; // fallback false if not set

// Fixed base (CORS-aware). If backend served elsewhere adjust here or via VITE_API_BASE.
const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

export function useExoplanetAI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aborted, setAborted] = useState(false);
  const controllerRef = useRef(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setAborted(false);
    setStatus(null);
  }, []);

  const mockRun = useCallback(async (mission, file) => {
    setLoading(true);
    setError(null); setData(null); setAborted(false); setStatus(null);
    await new Promise(r => setTimeout(r, 1200));
    const light_curve = Array.from({ length: 150 }, (_, i) => ({
      time: i * 0.02,
      flux: 1 - (Math.sin(i * 0.11) * 0.004) - (i % 41 === 0 ? 0.018 : 0)
    }));
    const payload = {
      mission,
      fileName: file?.name || 'mock.csv',
      candidates: [
        { id: 'cand-1', epoch: 0.84, depth: 0.018, snr: 11.2 },
        { id: 'cand-2', epoch: 2.02, depth: 0.009, snr: 6.9 }
      ],
      light_curve,
      mock: true,
      generated_at: new Date().toISOString()
    };
    setData(payload);
    setLoading(false);
    return payload;
  }, []);

  const apiRun = useCallback(async (mission, file) => {
  setLoading(true);
  setError(null); setData(null); setAborted(false); setStatus(null);

    if (!mission) {
      const e = new Error('Mission is required');
      setError(e); setLoading(false); return null;
    }
    if (!file) {
      const e = new Error('File is required');
      setError(e); setLoading(false); return null;
    }

    const form = new FormData();
    form.append('mission', mission);
    form.append('file', file);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: form,
        signal: controller.signal
      });

      if (!res.ok) {
        setStatus(res.status);
        const contentType = res.headers.get('content-type') || '';
        let detail = `HTTP ${res.status}`;
        if (contentType.includes('application/json')) {
          try { const j = await res.json(); detail += ` - ${j.detail || JSON.stringify(j)}`; } catch {}
        } else {
          try { detail += ' - ' + (await res.text()).slice(0, 200); } catch {}
        }
        throw new Error(detail);
      }

      const json = await res.json();
      // Normalize keys to required shape.
      const normalized = {
        mission,
        fileName: file.name,
        candidates: json.candidates || json.Candidates || [],
        light_curve: json.light_curve || json.lightCurve || json.data || [],
        ...json
      };
      setData(normalized);
      return normalized;
    } catch (err) {
      if (err.name === 'AbortError') {
        setAborted(true);
      } else {
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }, []);

  const run = useCallback(async ({ mission, file }) => {
    if (USE_MOCK) {
      return mockRun(mission, file);
    }
    return apiRun(mission, file);
  }, [apiRun, mockRun]);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }, []);

  return { run, data, error, loading, aborted, abort, reset, mockMode: USE_MOCK, apiBase: API_BASE, status };
}

export default useExoplanetAI;
