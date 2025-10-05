# Deployment Guide

## Quick Deploy to Google Cloud Run

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Project ID ready

### Steps

1. **Set your project**
   ```bash
   export PROJECT_ID="your-project-id"
   gcloud config set project $PROJECT_ID
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
   ```

3. **Build and push container**
   ```bash
   cd flask_app
   gcloud builds submit --tag gcr.io/$PROJECT_ID/mpga-flask
   ```

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy mpga \
     --image gcr.io/$PROJECT_ID/mpga-flask \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 1Gi \
     --cpu 2 \
     --max-instances 10 \
     --timeout 60s
   ```

5. **Get the URL**
   ```bash
   gcloud run services describe mpga --region us-central1 --format='value(status.url)'
   ```

## Alternative: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mpga:
    build: .
    ports:
      - "8080:8080"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

Run:
```bash
docker-compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |
| `FLASK_ENV` | production | Flask environment |
| `WORKERS` | 2 | Gunicorn workers |
| `THREADS` | 4 | Threads per worker |

## Monitoring

### Health Check
```bash
curl https://your-app.run.app/health
```

Expected: `{"status":"healthy"}`

### Logs (Cloud Run)
```bash
gcloud run services logs read mpga --region us-central1 --limit 50
```

## Scaling Configuration

**Automatic scaling** (Cloud Run):
- Min instances: 0 (scales to zero when idle)
- Max instances: 10 (adjust based on traffic)
- Concurrent requests: 80 per instance

**Manual scaling**:
```bash
gcloud run services update mpga \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20
```

## Cost Optimization

1. **Scale to zero**: Allow 0 min instances for development
2. **Request timeout**: Keep at 60s to avoid long-running requests
3. **Memory**: 1Gi is sufficient, don't overprovision
4. **CPU**: Only allocated during request processing

## Security

1. **HTTPS enforced**: Cloud Run provides automatic HTTPS
2. **CORS configured**: Only allow specific origins in production
3. **File validation**: CSV validation prevents malicious uploads
4. **Rate limiting**: Consider adding rate limiting for production

## Custom Domain

```bash
gcloud beta run domain-mappings create \
  --service mpga \
  --domain your-domain.com \
  --region us-central1
```

Then add DNS records as instructed by gcloud.

## Rollback

If deployment has issues:

```bash
# List revisions
gcloud run revisions list --service mpga --region us-central1

# Rollback to previous revision
gcloud run services update-traffic mpga \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Build and Deploy
      run: |
        cd flask_app
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/mpga-flask
        gcloud run deploy mpga \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/mpga-flask \
          --region us-central1 \
          --platform managed
```

## Troubleshooting

### Container fails to start
- Check logs: `gcloud run services logs read mpga --limit 100`
- Verify health endpoint: `/health`
- Check port configuration (must be 8080)

### Static files not loading
- Verify assets copied in Dockerfile
- Check static file paths in `app.py`
- Test locally first

### High latency
- Enable Cloud CDN for static assets
- Consider caching for API responses
- Check database query performance (if added)

## Post-Deployment Checklist

- [ ] Health check passes
- [ ] Can access main page
- [ ] File upload works
- [ ] Detection API responds
- [ ] 3D Pluto loads
- [ ] Chatbot works
- [ ] No console errors
- [ ] Logs show no errors
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Alerts configured

## Support

For deployment issues:
1. Check logs first
2. Review TESTING.md for validation steps
3. Verify all checklist items above
4. Open GitHub issue if problem persists
