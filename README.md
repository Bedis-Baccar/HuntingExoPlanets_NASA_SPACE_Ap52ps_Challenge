## MPGA Exoplanet Explorer

Modern React + Vite + Tailwind frontend with FastAPI backend for light curve ingestion and exoplanet candidate detection. Includes Three.js starfield background, Plotly light curve viewer, mission selection, CSV validation, an educational chatbot, and a 3D Pluto orbit accent.

### Tech Stack
- Frontend: Vite, React 18, Tailwind CSS
- Visualization: Plotly.js (dist-min)
- Graphics: Three.js (starfield / nebula, OBJ/GLB Pluto loader)
- State: Custom React Context + hooks
- Backend: FastAPI (prediction endpoint planned)

### Development Setup
1. Install Node dependencies:
   npm install
2. (Optional) Activate Python/Conda env & run FastAPI backend:
   uvicorn backend_app:app --reload
3. Start frontend dev server:
   npm run dev

Backend uploads need `python-multipart` (in environment.yml). If missing:
   pip install python-multipart

### Dev Proxy
Requests starting with /api are proxied to http://localhost:8000 (see vite.config.js). Override with:
   BACKEND_URL=https://api.example.com npm run dev

### API Base Resolution
`useExoplanetAI` chooses base:
1. `VITE_API_BASE` if set
2. `/api` in dev (proxy)
3. '' in production (same origin)

### Environment Variables
Create `.env` (ignored):
VITE_API_BASE=https://api.example.com

### Mock Mode
In browser console:
window.USE_MOCK = true
Then re-run detection to simulate results.

### CORS (if skipping proxy)
Add frontend origin(s) in FastAPI CORS middleware.

### Prediction Endpoint Contract (Planned)
POST /predict (multipart/form-data)
- mission: string
- file: CSV (time, flux columns)
Response (example):
{
  "mission": "tess",
  "fileName": "curve.csv",
  "meta": { "processedAt": "2025-01-01T00:00:00Z" },
  "lightCurve": [{ "t": 0.0, "flux": 0.9998 }, ...],
  "candidates": [{ "id": "cand-1", "epoch": 12.34, "depth": 0.0021, "snr": 15.6 }]
}

### Detection UI
- `DetectionInterface.jsx`: Orchestrates mission select, CSV upload, run/abort/reset, progress, visualization.
- `ProgressBar.jsx`: Simulated progress.
- `Toast*.jsx`: Notifications (errors, success, abort).
- `LightCurveViewer.jsx`: Plotly rendering with candidate highlighting.

### CSV Validation
`validateCSV.js` checks headers for time/flux and numeric rows; structural errors raise descriptive toasts.

### Global State
`AppContext.jsx` persists mission, uploaded file meta, detection result, chatbot state via localStorage.

### Chatbot & Facts
`astronomyFacts.js` provides >15 curated facts; chatbot presents educational Q&A with accessibility (focus trap, aria-live feedback, reduced-motion respect).

### 3D Pluto Orbit
`PlutoOrbit.jsx` uses dynamic loaders. Now prefers `/models/pluto.glb` if present (GLTF) else falls back to OBJ+MTL (`/models/pluto.obj`, `/models/pluto.mtl`). Applies normalization, optional emissive tint, aura shell, and respects `prefers-reduced-motion`.

### Performance Notes
- Plotly chunk isolated; consider code-splitting heavy panels.
- Large OBJ (~66MB) may benefit from conversion to compressed glTF (Draco or gltfpack) to reduce load.

### Next Steps
- Implement real FastAPI /predict
- Model inference integration (transit detection)
- Add tests (CSV parsing, hook logic)
- PWA manifest & multi-size icons
- Optional GLB replacement for Pluto model

### License
Project is released under the MIT License (see `LICENSE`).

---
Hackathon project: Make Pluto Great Again (MPGA)
