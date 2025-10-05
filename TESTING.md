# Flask App Testing Guide

## Pre-Launch Checklist

Before testing, ensure:
- [ ] Python 3.11+ installed
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] Static assets copied (models/, images/, etc.)

## Local Testing

### 1. Start Development Server

```bash
./start.sh
# Or manually:
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

### 2. Verify Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"healthy"}`

### 3. Test Main Page

Open browser: `http://localhost:5000`

**Check:**
- [ ] Page loads without errors
- [ ] Pluto 3D animation visible in background
- [ ] Header with logo and "MPGA" title
- [ ] Mission selector dropdown present
- [ ] File upload dropzone visible
- [ ] "Ask Astro" chatbot button present

### 4. Test File Upload

1. Select a mission from dropdown (e.g., "Kepler")
2. Create a test CSV file:
   ```bash
   echo "time,flux
   0,1.0
   1,0.998
   2,0.995
   3,0.997
   4,1.0" > test_lightcurve.csv
   ```
3. Drag and drop `test_lightcurve.csv` into dropzone
   - [ ] File info appears
   - [ ] "Analyze Light Curve" button enabled
   - [ ] Green checkmark displayed

4. Click "Analyze Light Curve"
   - [ ] Loading spinner appears
   - [ ] Request sent to `/api/predict`
   - [ ] Results section appears
   - [ ] Detection card shows result
   - [ ] Plotly light curve chart renders

### 5. Test Detection API Directly

```bash
curl -X POST http://localhost:5000/api/predict \
  -F "mission=kepler" \
  -F "file=@test_lightcurve.csv"
```

Expected JSON response:
```json
{
  "prediction": "Exoplanet Detected",
  "confidence": 0.85,
  "mission": "kepler",
  "light_curve": {
    "time": [0, 1, 2, ...],
    "flux": [1.0, 0.998, ...]
  }
}
```

### 6. Test Chatbot

1. Click "Ask Astro" button
   - [ ] Modal opens
   - [ ] Welcome message visible
   - [ ] Input field focused

2. Type questions:
   - "What is an exoplanet?"
   - "Tell me about Kepler"
   - "How does the transit method work?"
   
   - [ ] Responses appear
   - [ ] Chat history preserved
   - [ ] Scrolling works

3. Close chatbot
   - [ ] Modal closes smoothly

### 7. Test Toast Notifications

- [ ] Success toast on file upload
- [ ] Error toast on invalid file
- [ ] Info toast on page load
- [ ] Toasts auto-dismiss after 4 seconds
- [ ] Manual dismiss works

### 8. Test 3D Pluto Orbit

- [ ] Canvas element present
- [ ] Pluto model loads (GLB or OBJ fallback)
- [ ] Pluto rotates
- [ ] Pluto orbits in elliptical path
- [ ] Camera gently moves
- [ ] Stars visible in background

### 9. Test Static Assets

Check console for 404 errors on:
- [ ] `/pluto.png` - Logo/favicon
- [ ] `/favicon.ico` - Favicon
- [ ] `/site.webmanifest` - PWA manifest
- [ ] `/robots.txt` - SEO file
- [ ] `/static/css/main.css` - Styles
- [ ] `/static/js/main.js` - Main script
- [ ] `/models/pluto.glb` or `/models/pluto.obj` - 3D model

### 10. Test State Persistence

1. Select a mission
2. Refresh page
   - [ ] Mission selection persisted in localStorage
   - [ ] Chat history persisted (if any)

### 11. Test Responsive Design

Test on different viewport sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Check:
- [ ] Layout adapts properly
- [ ] No horizontal scrolling
- [ ] Touch interactions work
- [ ] Chatbot modal responsive

### 12. Browser Compatibility

Test in:
- [ ] Chrome/Chromium 90+
- [ ] Firefox 88+
- [ ] Safari 14+ (if on macOS)
- [ ] Edge 90+

## Error Scenarios

### Test Invalid File Upload

1. Upload `.txt` file instead of `.csv`
   - [ ] Error toast displayed
   - [ ] File not accepted

2. Upload oversized file (> 10MB)
   - [ ] Error toast: "File size exceeds 10MB limit"

3. Upload without selecting mission
   - [ ] "Analyze" button disabled

### Test Invalid CSV Data

Upload malformed CSV:
```csv
invalid,data
no,time,column
```

- [ ] API returns 400 error
- [ ] Error toast displayed

### Test Network Errors

1. Stop Flask server
2. Try to analyze data
   - [ ] Error toast displayed
   - [ ] Graceful failure (no crash)

## Performance Checks

### Load Time
- First contentful paint < 2s
- Time to interactive < 3s

### Memory Usage
- Check browser DevTools > Performance
- No memory leaks on repeated uploads
- Pluto animation doesn't cause lag

### Console Errors
- [ ] No JavaScript errors
- [ ] No 404s for static assets
- [ ] No CORS errors
- [ ] Only expected warnings (if any)

## Docker Testing

### Build Container

```bash
docker build -t mpga-flask .
```

- [ ] Build succeeds
- [ ] No errors during pip install

### Run Container

```bash
docker run -p 8080:8080 mpga-flask
```

- [ ] Container starts
- [ ] Health check passes
- [ ] App accessible on `http://localhost:8080`

### Test in Container

Repeat main tests from step 3-9 with `http://localhost:8080` instead of `http://localhost:5000`.

## Production Readiness

- [ ] All tests pass
- [ ] No console errors
- [ ] All features functional
- [ ] Docker build succeeds
- [ ] Documentation complete
- [ ] README.md accurate

## Known Issues / Expected Behavior

1. **Mock Detection**: Currently returns deterministic mock data based on mission name. This is expected until real ML model is integrated.

2. **Three.js Loaders**: If 3D model loaders fail, a fallback sphere is created. This is graceful degradation.

3. **Browser Storage**: State persists in localStorage. Clear it via DevTools > Application > Local Storage if needed for fresh testing.

## Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Static files not loading
- Check `flask_app/static/` directory exists
- Verify assets copied from `mpga/public/`

### Three.js errors
- Check browser console
- Verify Three.js CDN loaded
- Try different model format (GLB vs OBJ)

## Success Criteria

✅ All checklist items passed  
✅ No console errors  
✅ All features functional  
✅ Docker build successful  
✅ Performance acceptable  

## Next Steps After Testing

1. Replace mock detection with real ML model
2. Add more comprehensive error handling
3. Implement analytics/telemetry
4. Add more chatbot knowledge
5. Optimize bundle sizes (if needed)
6. Deploy to production (Cloud Run)
