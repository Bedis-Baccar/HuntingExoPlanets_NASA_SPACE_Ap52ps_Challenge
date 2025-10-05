/**
 * Detection Interface Module
 * Handles file upload, mission selection, and exoplanet detection analysis
 */

import { getState, setState } from './state.js';
import { toast } from './toast.js';

export class DetectionInterface {
    constructor() {
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('file-input');
        this.missionSelect = document.getElementById('mission-select');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadingState = document.getElementById('loading-state');
        this.fileInfo = document.getElementById('file-info');
        this.resultsSection = document.getElementById('results-section');
        
        this.selectedFile = null;
        
        this.init();
    }

    /**
     * Initialize event listeners
     */
    init() {
        // Dropzone click to open file picker
        this.dropzone.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // Drag and drop handlers
        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('border-space-primary', 'bg-gray-700/30');
        });
        
        this.dropzone.addEventListener('dragleave', () => {
            this.dropzone.classList.remove('border-space-primary', 'bg-gray-700/30');
        });
        
        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('border-space-primary', 'bg-gray-700/30');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
        
        // Mission select
        this.missionSelect.addEventListener('change', () => {
            this.updateAnalyzeButton();
            setState({ selectedMission: this.missionSelect.value });
        });
        
        // Remove file button
        const removeBtn = document.getElementById('remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearFile();
            });
        }
        
        // Analyze button
        this.analyzeBtn.addEventListener('click', () => {
            this.analyzeData();
        });
    }

    /**
     * Handle file selection
     */
    handleFileSelect(file) {
        // Validate file type
        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size exceeds 10MB limit');
            return;
        }
        
        this.selectedFile = file;
        this.showFileInfo(file);
        this.updateAnalyzeButton();
        
        setState({ uploadedFile: file.name });
        toast.success(`File "${file.name}" selected`);
    }

    /**
     * Show file information
     */
    showFileInfo(file) {
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        this.fileInfo.classList.remove('hidden');
        this.dropzone.classList.add('border-green-500');
    }

    /**
     * Clear selected file
     */
    clearFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.fileInfo.classList.add('hidden');
        this.dropzone.classList.remove('border-green-500');
        this.updateAnalyzeButton();
        
        setState({ uploadedFile: null });
    }

    /**
     * Update analyze button state
     */
    updateAnalyzeButton() {
        const canAnalyze = this.selectedFile && this.missionSelect.value;
        this.analyzeBtn.disabled = !canAnalyze;
        if (this.analyzeBtn.disabled) {
            this.analyzeBtn.classList.add('opacity-50','cursor-not-allowed');
        } else {
            this.analyzeBtn.classList.remove('opacity-50','cursor-not-allowed');
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Analyze light curve data
     */
    async analyzeData() {
        if (!this.selectedFile || !this.missionSelect.value) {
            toast.error('Please select a mission and upload a file');
            return;
        }
        
        // Show loading state
        this.analyzeBtn.disabled = true;
        this.loadingState.classList.remove('hidden');
        setState({ isAnalyzing: true });
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('mission', this.missionSelect.value);
            
            // Call API
            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            // Update state
            setState({
                detectionResult: result,
                lightCurveData: result.light_curve,
                isAnalyzing: false
            });
            
            // Display results
            this.displayResults(result);
            
            toast.success('Analysis complete!');
            
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(`Analysis failed: ${error.message}`);
            setState({ isAnalyzing: false });
        } finally {
            this.loadingState.classList.add('hidden');
            this.analyzeBtn.disabled = false;
        }
    }

    /**
     * Display detection results
     */
    displayResults(result) {
        // Show results section
        this.resultsSection.classList.remove('hidden');
        
        // Populate detection card
        const detectionResult = document.getElementById('detection-result');
        const detectionClass = result.prediction === 'Exoplanet Detected' ? 'success' : 'neutral';
        const icon = result.prediction === 'Exoplanet Detected' ? '✓' : '○';
        const bgColor = result.prediction === 'Exoplanet Detected' ? 'bg-green-500/20' : 'bg-gray-700';
        const borderColor = result.prediction === 'Exoplanet Detected' ? 'border-green-500' : 'border-gray-600';
        
        detectionResult.innerHTML = `
            <div class="flex items-center gap-4 p-6 ${bgColor} border ${borderColor} rounded-lg">
                <div class="text-4xl">${icon}</div>
                <div class="flex-1">
                    <h4 class="text-2xl font-semibold mb-2">${result.prediction}</h4>
                    <p class="text-gray-300">
                        Confidence: <span class="font-bold text-space-primary">${(result.confidence * 100).toFixed(1)}%</span>
                    </p>
                    <p class="text-sm text-gray-400 mt-1">
                        Mission: ${result.mission.toUpperCase()} • Points analyzed: ${result.light_curve.time.length}
                    </p>
                </div>
            </div>
            
            ${result.prediction === 'Exoplanet Detected' ? `
                <div class="mt-4 p-4 bg-gray-700/50 rounded-lg">
                    <h5 class="font-semibold mb-2">Detection Details</h5>
                    <ul class="space-y-1 text-sm text-gray-300">
                        <li>• Transit depth detected in light curve</li>
                        <li>• Periodic signal consistent with planetary orbit</li>
                        <li>• Signal-to-noise ratio meets detection threshold</li>
                    </ul>
                </div>
            ` : ''}
        `;
        
        // Create light curve plot
        this.createLightCurvePlot(result.light_curve);
        
        // Smooth scroll to results after layout paint
        requestAnimationFrame(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /**
     * Create Plotly light curve visualization
     */
    createLightCurvePlot(lightCurve) {
        const trace = {
            x: lightCurve.time,
            y: lightCurve.flux,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Normalized Flux',
            line: {
                color: '#b83c2c',
                width: 2
            },
            marker: {
                color: '#fcecce',
                size: 3,
                opacity: 0.6
            }
        };
        
        const layout = {
            title: {
                text: 'Light Curve Analysis',
                font: {
                    color: '#fcecce',
                    size: 18
                }
            },
            xaxis: {
                title: 'Time (days)',
                gridcolor: '#3d3d40',
                color: '#fcecce'
            },
            yaxis: {
                title: 'Normalized Flux',
                gridcolor: '#3d3d40',
                color: '#fcecce'
            },
            plot_bgcolor: '#1f1f21',
            paper_bgcolor: '#252627',
            font: {
                color: '#fcecce'
            },
            hovermode: 'closest',
            margin: {
                l: 60,
                r: 40,
                t: 60,
                b: 60
            }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        };
        
        Plotly.newPlot('light-curve-plot', [trace], layout, config);
    }
}
