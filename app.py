"""
MPGA Flask Application
Python-only stack for exoplanet detection and visualization
"""
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sys
import math
import random
from datetime import datetime

# Local utilities
from utils.validate_csv import validate_csv
from models.exoplanet_model import load_model
from utils.astronomy_facts import FACTS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit
app.config['UPLOAD_FOLDER'] = 'uploads'

# CORS (adjust for production)
CORS(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    """Serve main application page"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "version": "1.0.0"})

@app.route('/facts')
def facts():
    """Return static astronomy facts."""
    return jsonify({"facts": FACTS, "count": len(FACTS)})

LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
SUBSCRIBE_LOG = os.path.join(LOG_DIR, 'subscriptions.log')
CONTACT_LOG = os.path.join(LOG_DIR, 'contacts.log')

def _append_log(path: str, line: str):
    try:
        with open(path, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception as e:
        print(f"[LOGGING ERROR] {e}", file=sys.stderr)

@app.route('/subscribe', methods=['POST'])
def subscribe():
    """Simple newsletter subscription endpoint."""
    email = (request.form.get('email') or '').strip()
    if not email or '@' not in email:
        return jsonify({"error": "Invalid email"}), 400
    line = f"{datetime.utcnow().isoformat()}Z\temail={email}"
    print(f"[SUBSCRIBE] {line}")
    _append_log(SUBSCRIBE_LOG, line)
    return jsonify({"status": "ok"})

@app.route('/contact', methods=['POST'])
def contact():
    """Contact form endpoint capturing name, email, message."""
    name = (request.form.get('name') or '').strip()
    email = (request.form.get('email') or '').strip()
    message = (request.form.get('message') or '').strip()
    if not name or not email or '@' not in email or not message:
        return jsonify({"error": "Missing or invalid fields"}), 400
    # Sanitize tabs/newlines from message before logging to avoid f-string backslash issues
    sanitized_message = message.replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')
    line = f"{datetime.utcnow().isoformat()}Z\tname={name}\temail={email}\tmessage={sanitized_message}"
    print(f"[CONTACT] {line}")
    _append_log(CONTACT_LOG, line)
    return jsonify({"status": "ok"})

@app.route('/predict', methods=['POST'])
def predict_v2():
    """Advanced prediction route using real CSV validation & model abstraction.

    Expects multipart/form-data with fields:
      - mission: one of kepler|k2|tess
      - csv_file: uploaded CSV containing time/flux columns
    Returns JSON with summary, candidates, and light curve arrays.
    """
    try:
        mission = (request.form.get('mission') or '').lower().strip()
        if mission not in {'kepler', 'k2', 'tess'}:
            return jsonify({"error": "Invalid mission. Allowed: kepler, k2, tess"}), 400

        if 'csv_file' not in request.files:
            return jsonify({"error": "Missing file field 'csv_file'"}), 400
        file = request.files['csv_file']
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400

        # Validate & parse CSV
        try:
            parsed = validate_csv(file)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        model = load_model()
        try:
            inference = model.infer(parsed['time'], parsed['flux'])
        except Exception as me:
            return jsonify({"error": f"Model inference failure: {me}"}), 500

        # Build enriched light curve structure (list of {t, flux})
        light_curve = [
            {"t": float(t), "flux": float(f)} for t, f in zip(parsed['time'], parsed['flux'])
        ]

        response = {
            "mission": mission,
            "meta": {
                "rows": parsed['row_count'],
                "columns": parsed['columns'],
                "processedAt": datetime.utcnow().isoformat() + 'Z',
                "modelVersion": inference['summary']['model_version']
            },
            "summary": {
                "nPoints": inference['summary']['n_points'],
                "meanFlux": inference['summary']['mean_flux'],
                "stdFlux": inference['summary']['std_flux']
            },
            "candidates": inference['candidates'],
            "lightCurve": light_curve
        }
        return jsonify(response)
    except Exception as e:
        # Unexpected server error path
        return jsonify({"error": f"Internal error: {e}"}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Exoplanet detection endpoint
    Accepts: mission (str), file (CSV upload)
    Returns: Mock light curve + candidates (replace with real model)
    """
    # Validate mission
    mission = request.form.get('mission', '').lower()
    if mission not in ['kepler', 'k2', 'tess']:
        return jsonify({"error": "Invalid mission. Use: kepler, k2, or tess"}), 400
    
    # Validate file upload
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files accepted"}), 400
    
    # Basic CSV validation
    try:
        content = file.read(4096).decode('utf-8', errors='replace')
        file.seek(0)  # Reset for potential future use
        
        if ',' not in content and '\t' not in content:
            return jsonify({"error": "File does not appear to be CSV/TSV"}), 400
    except Exception as e:
        return jsonify({"error": f"File read error: {str(e)}"}), 400
    
    # Generate mock light curve (deterministic by mission)
    random.seed(mission)
    light_curve = []
    for i in range(180):
        t = i * 0.02
        flux = 1 - (math.sin(i * 0.07) * 0.004) - (0.018 if i % 53 == 0 else 0)
        light_curve.append({"t": round(t, 5), "flux": round(flux, 6)})
    
    candidates = [
        {
            "id": f"{mission}-cand-1",
            "epoch": 1.12,
            "depth": 0.0182,
            "snr": 11.7,
            "duration": 0.15
        },
        {
            "id": f"{mission}-cand-2",
            "epoch": 1.94,
            "depth": 0.0079,
            "snr": 7.0,
            "duration": 0.12
        }
    ]
    
    return jsonify({
        "mission": mission,
        "fileName": secure_filename(file.filename),
        "meta": {
            "processedAt": datetime.utcnow().isoformat() + "Z",
            "mock": True,
            "rowsSampled": len(light_curve)
        },
        "lightCurve": light_curve,
        "candidates": candidates
    })

# Serve static assets from public/
@app.route('/models/<path:filename>')
def serve_models(filename):
    """Serve 3D model files (OBJ, MTL, GLB)"""
    return send_from_directory('static/models', filename)

@app.route('/favicon.ico')
def serve_favicon():
    """Serve favicon"""
    return send_from_directory('static', 'favicon.ico')

@app.route('/pluto.png')
def serve_pluto():
    """Serve pluto.png from static/images (for favicon/PWA icons)"""
    return send_from_directory('static/images', 'pluto.png')

@app.route('/site.webmanifest')
def serve_manifest():
    """Serve PWA manifest"""
    return send_from_directory('static', 'site.webmanifest')

@app.route('/robots.txt')
def serve_robots():
    """Serve robots.txt"""
    return send_from_directory('static', 'robots.txt')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
