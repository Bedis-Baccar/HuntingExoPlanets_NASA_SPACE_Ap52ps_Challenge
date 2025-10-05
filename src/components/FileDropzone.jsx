import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateCSV } from '../utils/validateCSV.js';
import { useAppContext } from '../AppContext.jsx';

export default function FileDropzone() {
  const { setFile, uploadedFile, isProcessing } = useAppContext();
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setError(null); setWarning(null);
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const { valid, reason, warning: warn } = validateCSV(file);
    if (!valid) { setError(reason); return; }
    if (warn) setWarning(warn);
    setFile(file);
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'text/csv': ['.csv'] }
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps({
          className: [
            'border-2 border-dashed rounded-xl p-8 cursor-pointer transition',
            'bg-space/40 backdrop-blur-sm',
            isDragActive ? 'border-space-primary/80 bg-space-primary/10' : 'border-space-primary/40 hover:border-space-primary/70'
          ].join(' ')
        })}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        <div className="text-center">
          <p className="font-heading tracking-wide text-space-primary mb-2">Upload Light Curve (.csv)</p>
          <p className="text-xs text-space/70">Drop your file here or click to browse. Only one file is kept.</p>
          {uploadedFile && (
            <p className="mt-3 text-xs text-space/60">Selected: <span className="text-space-primary font-semibold">{uploadedFile.name}</span></p>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {warning && !error && <p className="text-xs text-amber-300">{warning}</p>}
    </div>
  );
}
