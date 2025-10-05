# Multi-stage build for MPGA (Make Pluto Great Again)
# Stage 1: Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Python backend + static serving
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    UVICORN_WORKERS=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_RELOAD=false

# System deps (if astropy/astroquery need compilers, add build tools then purge)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend_app.py ./

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./dist

# (Optional) copy any additional runtime assets (models, etc.)
COPY public/models ./dist/models

# Expose port for Cloud Run (expects $PORT env var)
EXPOSE 8080

# Health check (Cloud Run can use /health endpoint)

CMD ["bash", "-c", "uvicorn backend_app:app --host ${UVICORN_HOST} --port ${PORT}"]
