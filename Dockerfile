# MPGA Dockerfile (Flask only)
# Legacy React/FastAPI stack removed; this image serves Flask app with static assets.

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# System dependencies (extend if astropy needs more libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY templates/ templates/
COPY static/ static/
COPY utils/ utils/

# Create uploads directory
RUN mkdir -p /tmp/uploads

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -fsS http://localhost:8080/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--threads", "4", "--timeout", "60", "app:app"]
