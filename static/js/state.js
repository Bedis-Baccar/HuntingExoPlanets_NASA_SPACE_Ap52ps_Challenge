/**
 * State Management System
 * Replaces React Context API with vanilla JS custom events + localStorage
 */

export class StateManager {
    constructor(initialState = {}) {
        this.state = this.loadState() || initialState;
        this.listeners = new Map();
        this.storageKey = 'mpga_app_state';
    }

    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
            return null;
        }
    }

    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set state and notify listeners
     */
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        this.saveState();
        
        // Notify listeners
        this.listeners.forEach((callback, key) => {
            callback(this.state, prevState);
        });
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('stateChange', {
            detail: { state: this.state, prevState }
        }));
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        this.listeners.set(key, callback);
        return () => this.listeners.delete(key);
    }

    /**
     * Clear all state
     */
    clearState() {
        this.state = {};
        localStorage.removeItem(this.storageKey);
        this.setState({});
    }
}

// Create global state instance
export const appState = new StateManager({
    // Detection state
    selectedMission: null,
    uploadedFile: null,
    detectionResult: null,
    lightCurveData: null,
    isAnalyzing: false,
    
    // UI state
    chatbotOpen: false,
    chatHistory: [],
    
    // User preferences
    theme: 'dark',
    notifications: true
});

// Export convenience methods
export const getState = () => appState.getState();
export const setState = (updates) => appState.setState(updates);
export const subscribe = (key, callback) => appState.subscribe(key, callback);
