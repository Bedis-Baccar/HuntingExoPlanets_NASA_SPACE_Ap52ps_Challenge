/**
 * Lightweight Detection Interface (requested custom build)
 * - Embedded SatelliteSelector: 3 toggle cards with mission stats
 * - Embedded FileDropzone: drag/drop CSV with validation preview
 * - Single action button: "Lancer l’analyse IA" disabled until mission + file chosen
 * Integrates with global AppContext (selectedMission, setMission, setFile, uploadedFile).
 */
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../AppContext.jsx';
import { validateCSV, validateCSVStructure } from '../utils/validateCSV.js';
import useExoplanetAI from '../hooks/useExoplanetAI.js';
import ProgressBar from './ProgressBar.jsx';
import LightCurveViewer from './LightCurveViewer.jsx';
import Button from './Button.jsx';
import Card from './Card.jsx';
import { useToasts } from './ToastContainer.jsx';

const MISSIONS = [
  {
    key: 'Kepler',
    name: 'Kepler',
    stat: '530k+',
    desc: 'Courbes historiques riches pour transits.'
  },
  {
    key: 'K2',
    name: 'K2',
    stat: '400k+',
    desc: 'Campagnes ciblées après Kepler.'
  },
  {
    key: 'TESS',
    name: 'TESS',
    stat: '1.2M+',
    desc: 'Surveillance quasi‑totale du ciel.'
  }
];

function SatelliteSelector() {
  const { selectedMission, setMission } = useAppContext();
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {MISSIONS.map(m => {
        const active = selectedMission === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => setMission(m.key)}
            className={`relative group rounded-xl border transition overflow-hidden text-left px-4 py-5 flex flex-col gap-2
              ${active ? 'border-[#b83c2c] bg-[#b83c2c]/10 shadow-[0_0_0_1px_rgba(184,60,44,0.4)]' : 'border-[#b83c2c]/30 hover:border-[#b83c2c]/70 bg-white/5 hover:bg-white/10'}
            `}
            aria-pressed={active}
          >
            <span className="text-sm font-heading tracking-[0.15em] text-[#fcecce]">{m.name}</span>
            <span className="text-lg font-semibold text-[#b83c2c] leading-none">{m.stat}</span>
            <p className="text-[10px] leading-snug text-[#fcecce]/70">{m.desc}</p>
            {active && <span className="absolute inset-0 pointer-events-none ring-1 ring-[#b83c2c]/60 rounded-xl" />}
          </button>
        );
      })}
    </div>
  );
}

function FileDropzone({ onValidityChange }) {
  const { setFile, uploadedFile } = useAppContext();
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [structValid, setStructValid] = useState(false);
  const { push } = useToasts();

  const onDrop = useCallback(async (accepted) => {
    setError(null); setWarning(null); setStructValid(false);
    if (!accepted || accepted.length === 0) return;
    const file = accepted[0];
    const { valid, reason, warning: warn } = validateCSV(file);
    if (!valid) { setError(reason); onValidityChange(false); return; }
    if (warn) setWarning(warn);
    // Structural validation (async)
    try {
      const deep = await validateCSVStructure(file);
      if (!deep.valid) {
        const msg = deep.reason || 'Structure CSV invalide';
        setError(msg);
        push({ type: 'error', message: msg });
        onValidityChange(false);
        return;
      }
      setStructValid(true);
      onValidityChange(true);
    } catch (e) {
      setError('Lecture du fichier échouée');
      push({ type: 'error', message: 'Lecture du fichier échouée' });
      onValidityChange(false);
    }
    setFile(file);
  }, [setFile, onValidityChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'text/csv': ['.csv'] }
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps({
          className: `rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer select-none
            bg-white/5 backdrop-blur-sm
            ${isDragActive ? 'border-[#b83c2c] bg-[#b83c2c]/10' : 'border-[#b83c2c]/40 hover:border-[#b83c2c]/70'}
          `
        })}
      >
        <input {...getInputProps()} />
        <p className="font-heading tracking-wide text-[#b83c2c] mb-2">Dépose ton fichier CSV</p>
        <p className="text-xs text-[#fcecce]/70">Glisser-déposer ou cliquer pour parcourir. Une seule courbe de lumière.</p>
        {uploadedFile && (
          <div className="mt-4 text-xs text-[#fcecce]/80">
            <p><span className="text-[#b83c2c] font-semibold">{uploadedFile.name}</span> ({(uploadedFile.size/1024).toFixed(1)} kB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && warning && <p className="text-xs text-amber-300">{warning}</p>}
      {!error && uploadedFile && !structValid && <p className="text-[10px] text-amber-200">Validation structure en cours…</p>}
    </div>
  );
}

export default function DetectionInterface() {
  const { selectedMission, uploadedFile, startProcessing, finishProcessing, failProcessing, detectionResult, resetFile } = useAppContext();
  const { run, data, error, loading, aborted, abort, reset, mockMode } = useExoplanetAI();
  const [fileValid, setFileValid] = useState(false);
  const disabled = !selectedMission || !uploadedFile || !fileValid || loading;
  const [progress, setProgress] = useState(0);
  const { push } = useToasts();

  // Simulated smooth progress toward 90% while loading
  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    let pct = 0; let raf; let lastTs = performance.now();
    const step = (ts) => {
      const dt = ts - lastTs; lastTs = ts;
      pct += (90 - pct) * 0.015 * (dt / 16.6);
      if (pct > 90) pct = 90;
      setProgress(pct);
      if (loading) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [loading]);

  // Push results / errors into global context for LightCurveViewer consumption
  useEffect(() => {
    if (loading) startProcessing();
  }, [loading, startProcessing]);
  useEffect(() => {
    if (data) {
      finishProcessing({
        lightCurve: data.lightCurve || data.light_curve || [],
        candidates: data.candidates || [],
        mission: data.mission,
        fileName: data.fileName,
        raw: data
      });
      push({ type: 'success', message: `Analyse terminée – ${data.candidates?.length || 0} candidat(s)` });
    }
  }, [data, finishProcessing, push]);
  useEffect(() => {
    if (error) {
      failProcessing(error);
      push({ type: 'error', message: error.message || 'Erreur lors de l\'analyse' });
    }
  }, [error, failProcessing, push]);

  const handleAnalyze = useCallback(async () => {
    if (disabled) return;
    reset();
    try {
      await run({ mission: selectedMission, file: uploadedFile });
    } catch (e) {
      // run already handles error state; toast added in effect
    }
  }, [disabled, run, selectedMission, uploadedFile, reset]);

  const handleAbort = useCallback(() => {
    abort();
  }, [abort]);

  const handleResetAll = useCallback(() => {
    abort();
    reset();
    resetFile();
    setProgress(0);
  }, [abort, reset, resetFile]);

  return (
    <section id="detection" aria-labelledby="detection-title" className="space-y-10 max-w-5xl mx-auto">
      <h2 id="detection-title" className="sr-only">Interface de détection</h2>
      <div className="space-y-8">
        <Card className="space-y-6" title="Sélection & Fichier">
          <div className="space-y-5">
            <SatelliteSelector />
            <FileDropzone onValidityChange={setFileValid} />
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
            <Button
              onClick={handleAnalyze}
              disabled={disabled}
              loading={loading}
              ariaLabel="Lancer l'analyse IA"
              size="lg"
            >{loading ? 'Analyse…' : 'Lancer l’analyse IA'}</Button>
            {loading && (
              <Button
                variant="ghost"
                onClick={handleAbort}
                ariaLabel="Annuler l'analyse"
                size="lg"
              >Annuler</Button>
            )}
            <Button
              variant="ghost"
              onClick={handleResetAll}
              ariaLabel="Réinitialiser la sélection et le fichier"
              size="lg"
            >Réinitialiser</Button>
            <span className="text-[10px] text-[#fcecce]/60 leading-tight sm:ml-auto">Mission: {selectedMission || '—'} | Fichier: {uploadedFile?.name || '—'} {mockMode && ' | Mock'}</span>
          </div>
          {disabled && !loading && (
            <p className="text-[10px] text-[#fcecce]/40">Sélectionner une mission et un fichier CSV valide pour activer l’analyse.</p>
          )}
          {loading && (
            <div className="space-y-2">
              <ProgressBar value={progress} label="Analyse de la courbe de lumière" />
              <p className="text-[10px] uppercase tracking-wider text-[#fcecce]/40">Traitement IA en cours…</p>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-400 break-words">Erreur: {error.message}</p>
          )}
          {aborted && !loading && (
            <p className="text-xs text-amber-300">Analyse annulée.</p>
          )}
        </Card>
        {data && !loading && !error && (
          <Card title="Résultats" className="space-y-2">
            <p className="text-xs text-[#fcecce]/70">Candidats détectés: <span className="text-[#b83c2c] font-semibold">{data.candidates?.length || 0}</span></p>
            {data.candidates?.length > 0 && (
              <ul className="text-[10px] grid gap-1 text-[#fcecce]/70">
                {data.candidates.map(c => (
                  <li key={c.id || c.epoch} className="flex justify-between gap-4">
                    <span>{c.id || 'cand'} @ {c.epoch}</span>
                    <span>Δ {c.depth ?? '—'} | SNR {c.snr ?? '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
      {detectionResult && (detectionResult.lightCurve || detectionResult.light_curve) && (
        <LightCurveViewer />
      )}
    </section>
  );
}
