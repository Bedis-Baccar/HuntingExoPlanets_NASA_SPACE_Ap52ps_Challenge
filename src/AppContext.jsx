import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

/**
 * Global application context for MPGA detection flow & UI state.
 *
 * State fields:
 * - selectedMission: string | null (e.g., 'NewHorizons', 'JWST', etc.)
 * - uploadedFile: File | null (user provided dataset / image / FITS reference placeholder)
 * - isProcessing: boolean (true while detection pipeline or API job runs)
 * - detectionResult: object | null (result payload from FastAPI or mock)
 * - chatbotOpen: boolean (controls chat panel visibility)
 *
 * Provided actions simplify transitions and keep components lean.
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Hydration from localStorage (guard against SSR or unavailable window)
  const safeParse = (key) => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const [selectedMission, setSelectedMission] = useState(() => safeParse('mpga:selectedMission'));
  const [uploadedFile, setUploadedFile] = useState(null); // File objects not persisted
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(() => safeParse('mpga:detectionResult'));
  const [chatbotOpen, setChatbotOpen] = useState(() => {
    const stored = safeParse('mpga:chatbotOpen');
    return stored === null ? false : !!stored;
  });

  // Track an abort controller for cancellable requests
  const activeControllerRef = useRef(null);

  const setMission = useCallback((mission) => {
    setSelectedMission(mission);
    try { window.localStorage.setItem('mpga:selectedMission', JSON.stringify(mission)); } catch {}
  }, []);

  const clearMission = useCallback(() => {
    setSelectedMission(null);
    try { window.localStorage.removeItem('mpga:selectedMission'); } catch {}
  }, []);

  const setFile = useCallback((file) => {
    setUploadedFile(file);
    setDetectionResult(null); // reset previous result when new file chosen
  }, []);

  const resetFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setDetectionResult(null);
  }, []);

  const finishProcessing = useCallback((result) => {
    setIsProcessing(false);
    setDetectionResult(result || null);
    try { window.localStorage.setItem('mpga:detectionResult', JSON.stringify(result || null)); } catch {}
  }, []);

  const failProcessing = useCallback((error) => {
    console.error('Detection failed:', error);
    setIsProcessing(false);
    const errPayload = { error: true, message: error?.message || 'Processing failed' };
    setDetectionResult(errPayload);
    try { window.localStorage.setItem('mpga:detectionResult', JSON.stringify(errPayload)); } catch {}
  }, []);

  const persistChatbot = (val) => {
    setChatbotOpen(val);
    try { window.localStorage.setItem('mpga:chatbotOpen', JSON.stringify(val)); } catch {}
  };
  const toggleChatbot = useCallback(() => persistChatbot(prev => !prev), []);
  const openChatbot = useCallback(() => persistChatbot(true), []);
  const closeChatbot = useCallback(() => persistChatbot(false), []);

  // Because we used a function that may receive previous state, adjust persistChatbot to handle function values.
  useEffect(() => {
    // Ensure toggle works if we passed a function
    if (typeof chatbotOpen === 'function') {
      const resolved = chatbotOpen(false);
      setChatbotOpen(resolved);
    }
  }, [chatbotOpen]);

  const cancelActiveRequest = useCallback(() => {
    if (activeControllerRef.current) {
      try { activeControllerRef.current.abort(); } catch (e) { /* noop */ }
      activeControllerRef.current = null;
      setIsProcessing(false);
    }
  }, []);

  /**
   * Example async detection flow wrapper using fetch.
   * Accepts an endpoint (FastAPI) and optional FormData or payload.
   */
  const runDetection = useCallback(async ({ endpoint = '/api/detect', payload, signal } = {}) => {
    try {
      startProcessing();
      const controller = new AbortController();
      activeControllerRef.current = controller;
      const finalSignal = signal || controller.signal;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: payload instanceof FormData ? payload : JSON.stringify(payload || {}),
        headers: payload instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
        signal: finalSignal
      });

      if (!res.ok) throw new Error(`Detection request failed (${res.status})`);
      const data = await res.json();
      finishProcessing(data);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('Detection aborted');
        return null;
      }
      failProcessing(err);
      return null;
    } finally {
      activeControllerRef.current = null;
    }
  }, [startProcessing, finishProcessing, failProcessing]);

  const value = {
    // state
    selectedMission,
    uploadedFile,
    isProcessing,
    detectionResult,
    chatbotOpen,
    // setters / actions
    setMission,
    clearMission,
    setFile,
    resetFile,
    startProcessing,
    finishProcessing,
    failProcessing,
    toggleChatbot,
    openChatbot,
    closeChatbot,
    runDetection,
    cancelActiveRequest
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}
