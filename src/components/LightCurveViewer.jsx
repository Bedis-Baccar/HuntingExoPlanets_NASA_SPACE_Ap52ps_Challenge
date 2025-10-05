import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext.jsx';

/**
 * LightCurveViewer
 * Renders flux vs time using Plotly. Highlights transit candidates from detectionResult.candidates.
 * Compatible with mock or real backend payload.
 * Expected detectionResult shape:
 * {
 *   lightCurve: [{ t: Number, flux: Number }, ...],
 *   candidates: [{ epoch: Number, depth: Number, duration?: Number, id?: String, ... }]
 * }
 */
export default function LightCurveViewer({ height = 420 }) {
  const { detectionResult } = useAppContext();
  const plotRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    let Plotly; // module reference

    async function render() {
      const lcRaw = detectionResult && (detectionResult.lightCurve || detectionResult.light_curve);
      if (!lcRaw) return;
      try {
        Plotly = (await import('plotly.js-dist-min')).default;
      } catch (e) {
        console.error('Failed to load Plotly', e);
        return;
      }
      if (destroyed) return;

  // Normalize points: support {t,flux} or {time,flux}
  const normalized = lcRaw.map(p => ({ t: p.t != null ? p.t : p.time, flux: p.flux }));
  // Optional downsampling for very large series (simple stride)
  const MAX_POINTS = 8000;
  const stride = normalized.length > MAX_POINTS ? Math.ceil(normalized.length / MAX_POINTS) : 1;
  const lc = stride === 1 ? normalized : normalized.filter((_, i) => i % stride === 0);
  const t = lc.map(p => p.t);
  const flux = lc.map(p => p.flux);

      const candidates = Array.isArray(detectionResult.candidates) ? detectionResult.candidates : [];

      // Construct shapes for candidate transit windows
      const BAND_COLOR = 'rgba(184,60,44,0.18)'; // #b83c2c with alpha
      const shapes = candidates.map((c) => {
        // Heuristic duration if not provided: 0.05 days
        const dur = c.duration || 0.05;
        return {
          type: 'rect',
          xref: 'x', yref: 'paper',
          x0: c.epoch - dur / 2,
          x1: c.epoch + dur / 2,
          y0: 0, y1: 1,
          fillcolor: BAND_COLOR,
          line: { width: 0 },
          layer: 'below'
        };
      });

      const trace = {
        x: t,
        y: flux,
        mode: 'lines',
        name: 'Flux',
        line: { color: '#fcecce', width: 1 },
        hovertemplate: 't=%{x:.3f}<br>flux=%{y:.6f}<extra></extra>'
      };

      const candidateMarkers = candidates.length ? [{
        x: candidates.map(c => c.epoch),
        y: candidates.map(c => {
          // Estimate baseline around candidate epoch (simple pick nearest point)
          const idx = t.findIndex(v => Math.abs(v - c.epoch) < 1e-6);
          return idx >= 0 ? flux[idx] : 1.0 - (c.depth || 0);
        }),
        mode: 'markers',
        name: 'Candidates',
        marker: { color: '#b83c2c', size: 8, symbol: 'circle-open' },
        hovertemplate: 'epoch=%{x:.3f}<br>flux=%{y:.6f}<extra></extra>'
      }] : [];

      const layout = {
        paper_bgcolor: '#252627',
        plot_bgcolor: '#252627',
        height,
        margin: { l: 50, r: 20, t: 30, b: 50 },
        font: { family: 'Inter, sans-serif', color: '#fcecce', size: 12 },
        xaxis: {
          title: 'Time',
          gridcolor: '#3a3b3c',
          zerolinecolor: '#3a3b3c',
          showspikes: true,
          spikethickness: 1,
          spikecolor: '#b83c2c',
          spikedash: 'solid'
        },
        yaxis: {
          title: 'Flux',
          gridcolor: '#3a3b3c',
          zerolinecolor: '#3a3b3c',
          showspikes: true,
          spikethickness: 1,
          spikecolor: '#b83c2c',
          spikedash: 'solid'
        },
        shapes,
        legend: { orientation: 'h', y: -0.2 },
        responsive: true,
        dragmode: 'pan'
      };

      const config = {
        displayModeBar: true,
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d','select2d'],
        displaylogo: false
      };

      await Plotly.newPlot(plotRef.current, [trace, ...candidateMarkers], layout, config);
      // Relayout on resize
      const resizeHandler = () => { Plotly.Plots.resize(plotRef.current); };
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }

    const cleanupPromise = render();

    return () => {
      destroyed = true;
      if (cleanupPromise && typeof cleanupPromise.then === 'function') {
        cleanupPromise.then((cleanup) => {
          if (cleanup) cleanup();
        });
      }
      if (plotRef.current && Plotly) {
        try { Plotly.purge(plotRef.current); } catch {}
      }
    };
  }, [detectionResult, height]);

  if (!detectionResult || !(detectionResult.lightCurve || detectionResult.light_curve)) {
    return <div className="text-xs text-space/60">No light curve data loaded.</div>;
  }

  return (
    <div className="w-full rounded-lg border border-space-primary/20 bg-space/60 backdrop-blur p-4">
      <h3 className="font-heading text-space-primary mb-3 text-sm tracking-wide">Light Curve</h3>
      <div ref={plotRef} />
      <p className="mt-2 text-[10px] text-space/50">Flux vs. Time. Red bands indicate candidate transit windows.</p>
    </div>
  );
}
