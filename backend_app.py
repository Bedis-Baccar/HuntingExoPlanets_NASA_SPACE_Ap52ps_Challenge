from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional

app = FastAPI(title="MPGA Backend", version="0.1.0")

# Basic CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/env-check")
async def env_check():
    return {"python": os.sys.version.split()[0]}

DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")
if os.path.isdir(DIST_DIR):
    # Mount built frontend assets at root
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")

    @app.get("/index.html")
    async def index_explicit():
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "service": "MPGA Backend",
            "version": app.version,
            "endpoints": ["/health", "/env-check", "/predict", "/docs", "/redoc"],
            "message": "Frontend build not found. Run 'npm run build'."
        }

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    """Serve index.html for unmatched routes when frontend is built (SPA fallback)."""
    if os.path.isdir(DIST_DIR):
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not Found")

@app.post("/predict")
async def predict(mission: str = Form(...), file: UploadFile = File(...), mock: Optional[bool] = Form(False)):
    """Temporary stub prediction endpoint.

    Accepts mission + CSV file and returns a mock response structure compatible with the frontend.
    Replace this logic with real preprocessing / model inference.
    """
    # Basic validation
    mission_l = mission.lower()
    if mission_l not in {"kepler", "k2", "tess"}:
        raise HTTPException(status_code=400, detail="Unsupported mission. Use kepler | k2 | tess")

    # (Optional) inspect a few bytes to ensure it's text/csv-ish
    head_bytes = await file.read(4096)
    try:
        head_text = head_bytes.decode("utf-8", errors="replace")
    finally:
        # Reset file pointer in case downstream logic needs full content later
        await file.seek(0)

    if not ("," in head_text or "\t" in head_text):
        raise HTTPException(status_code=400, detail="File does not appear to be a CSV/TSV")

    # Produce mock light curve & candidates (deterministic by mission for repeatability)
    import math, random
    random.seed(mission_l)
    light_curve = []
    for i in range(180):
        t = i * 0.02
        flux = 1 - (math.sin(i * 0.07) * 0.004) - (0.018 if i % 53 == 0 else 0)
        light_curve.append({"t": round(t, 5), "flux": round(flux, 6)})

    candidates = [
        {"id": f"{mission_l}-cand-1", "epoch": 1.12, "depth": 0.0182, "snr": 11.7},
        {"id": f"{mission_l}-cand-2", "epoch": 1.94, "depth": 0.0079, "snr": 7.0},
    ]

    return {
        "mission": mission_l,
        "fileName": file.filename,
        "meta": {
            "processedAt": os.getenv("MPGA_TIME", "") or __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "mock": True,
            "rowsSampled": len(light_curve)
        },
        "lightCurve": light_curve,
        "candidates": candidates,
    }
