# Deployment Issues - Fixed ✅

## Problems Identified
1. ❌ `/pluto.png` 404 - Icon file missing from public root
2. ❌ `/site.webmanifest` 404 - PWA manifest missing
3. ❌ Dockerfile only copied `public/models/` not entire `public/`
4. ⚠️ THREE.js deprecation warning (`outputEncoding` → `outputColorSpace`)
5. ⚠️ Unnecessary preload causing warnings

## Solutions Applied

### 1. Added `pluto.png` to Public Root
```bash
# Copied from models subfolder to root
cp public/models/pluto.png public/pluto.png
```

### 2. Created `site.webmanifest`
**File**: `public/site.webmanifest`
```json
{
  "name": "MPGA - Make Pluto Great Again",
  "short_name": "MPGA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#252627",
  "theme_color": "#b83c2c",
  "icons": [{"src": "/pluto.png", "sizes": "any", "type": "image/png"}]
}
```

### 3. Fixed Dockerfile Asset Copying
**Changed**:
```dockerfile
# OLD (incomplete):
COPY public/models ./dist/models

# NEW (complete):
COPY --from=frontend-build /app/public/ ./dist/
```
Now copies ALL public assets (favicon.ico, pluto.png, site.webmanifest, robots.txt, models/)

### 4. Updated THREE.js API (PlutoOrbit.jsx)
**Changed**:
```js
// OLD (deprecated):
gl.outputEncoding = THREE.sRGBEncoding;

// NEW (current):
gl.outputColorSpace = THREE.SRGBColorSpace;
```

### 5. Cleaned Up index.html
**Removed**:
- `crossorigin="use-credentials"` from manifest link (unnecessary)
- `<link rel="preload" as="image" href="/pluto.png" ...>` (causing unused preload warning)

## Redeploy Steps

### 1. Rebuild & Push Image
```bash
cd /home/arous/NASA\ Hackathon/mpga
PROJECT=$(gcloud config get-value project)
gcloud builds submit --tag gcr.io/$PROJECT/mpga:latest .
```

### 2. Update Cloud Run Service
```bash
gcloud run deploy mpga-web \
  --image gcr.io/$PROJECT/mpga:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. Verify Fixed Issues
```bash
SERVICE_URL=$(gcloud run services describe mpga-web --region us-central1 --format='value(status.url)')

# Test missing assets
curl -I $SERVICE_URL/pluto.png       # Should return 200
curl -I $SERVICE_URL/site.webmanifest  # Should return 200
curl -I $SERVICE_URL/favicon.ico     # Should return 200
curl -I $SERVICE_URL/models/pluto.obj  # Should return 200

# Open in browser - no more console errors!
echo "Visit: $SERVICE_URL"
```

## Expected Console After Fix
✅ No 404 errors for `/pluto.png`, `/site.webmanifest`, `/favicon.ico`
✅ No THREE.js deprecation warnings
✅ No unused preload warnings
✅ `/models/pluto.glb` and `/models/pluto.obj` load correctly
✅ OBJLoader dynamic import works

## Notes
- **GLB vs OBJ**: Your code tries GLB first, falls back to OBJ. Both should now load.
- **Connection Closed Errors**: If you still see `ERR_CONNECTION_CLOSED`, it's likely:
  - Cold start timeout (increase `--timeout` if needed)
  - Large file transfer interrupted (66MB pluto.obj is heavy)
  
### Optional: Compress Pluto Model
To eliminate connection issues with the 66MB OBJ:
```bash
# Convert to compressed glTF (requires Blender or gltfpack)
# Reduces size to ~5-10MB
gltfpack -i public/models/pluto.obj -o public/models/pluto.glb
```

---
**Status**: Ready to redeploy! Run the commands above to push fixed version.
