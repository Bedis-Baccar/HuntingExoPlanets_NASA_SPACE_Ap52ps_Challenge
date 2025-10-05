/**
 * Main Application Entry Point
 * Initializes all modules and manages application lifecycle
 */

import { appState, getState, setState } from './state.js';
import { toast } from './toast.js';
import { PlutoOrbit } from './pluto.js';
import { DetectionInterface } from './detection.js';
import { Chatbot } from './chatbot.js';

class App {
    constructor() {
        this.plutoOrbit = null;
        this.detectionInterface = null;
        this.chatbot = null;
        this.facts = [];
        this.factsLoaded = false;
        
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('[MPGA] Initializing application...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup all components
     */
    async setup() {
        try {
            // Initialize 3D Pluto orbit background
            await this.initPlutoOrbit();
            
            // Initialize detection interface
            this.detectionInterface = new DetectionInterface();
            console.log('[MPGA] Detection interface initialized');
            
            // Initialize chatbot
            this.chatbot = new Chatbot();
            console.log('[MPGA] Chatbot initialized');
            
            // Setup smooth scrolling for anchor links
            this.setupSmoothScroll();
            
            // Restore previous state if available
            this.restoreState();
            
            // Setup state change listeners
            this.setupStateListeners();
            
            // Show welcome message
            toast.info('Welcome to MPGA! Upload a light curve to detect exoplanets.', 5000);
            
            console.log('[MPGA] Application ready');

            // Setup facts modal & load facts lazily
            this.setupFactsModal();

            // Setup form submissions (contact & newsletter)
            this.setupFormSubmissions();

            // Setup mobile navigation toggle
            this.setupNavMenu();
            
        } catch (error) {
            console.error('[MPGA] Initialization error:', error);
            toast.error('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize Pluto 3D orbit background
     */
    async initPlutoOrbit() {
        try {
            // Wait for Three.js to be available
            if (typeof THREE === 'undefined') {
                console.warn('[MPGA] Three.js not loaded, skipping Pluto orbit');
                return;
            }
            
            this.plutoOrbit = new PlutoOrbit('pluto-canvas');
            console.log('[MPGA] Pluto orbit initialized');
            
        } catch (error) {
            console.error('[MPGA] Failed to initialize Pluto orbit:', error);
            // Non-critical error, continue without 3D background
        }
    }

    setupNavMenu() {
        const toggle = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links');
        if (!toggle || !links) return;
        const icon = document.getElementById('nav-toggle-icon');

        const closeMenu = () => {
            links.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
            if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
        };
        const openMenu = () => {
            links.classList.remove('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            if (icon) icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
        };

        toggle.addEventListener('click', () => {
            if (links.classList.contains('hidden')) openMenu(); else closeMenu();
        });

        // Close on link click (mobile only)
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                if (window.innerWidth < 768) closeMenu();
            });
        });

        // Close on resize to desktop to ensure proper state
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                links.classList.remove('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                closeMenu();
            }
        });
    }

    setupFormSubmissions() {
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const statusEl = document.getElementById('contact-status');
                const submitBtn = document.getElementById('contact-submit');
                if (statusEl) statusEl.textContent = 'Envoi...';
                submitBtn && (submitBtn.disabled = true);
                const fd = new FormData(contactForm);
                try {
                    const res = await fetch('/contact', { method: 'POST', body: fd });
                    const data = await res.json().catch(()=>({}));
                    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
                    if (statusEl) { statusEl.textContent = 'Message envoyé ✓'; statusEl.className = 'text-sm text-green-400'; }
                    toast.success('Message envoyé');
                    contactForm.reset();
                } catch (err) {
                    if (statusEl) { statusEl.textContent = err.message || 'Erreur'; statusEl.className = 'text-sm text-red-400'; }
                    toast.error('Échec de l\'envoi');
                } finally {
                    submitBtn && (submitBtn.disabled = false);
                }
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const statusEl = document.getElementById('newsletter-status');
                const submitBtn = document.getElementById('newsletter-submit');
                if (statusEl) statusEl.textContent = 'Inscription...';
                submitBtn && (submitBtn.disabled = true);
                const fd = new FormData(newsletterForm);
                try {
                    const res = await fetch('/subscribe', { method: 'POST', body: fd });
                    const data = await res.json().catch(()=>({}));
                    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
                    if (statusEl) { statusEl.textContent = 'Inscription confirmée ✓'; statusEl.className = 'text-sm text-green-400'; }
                    toast.success('Inscription réussie');
                    newsletterForm.reset();
                } catch (err) {
                    if (statusEl) { statusEl.textContent = err.message || 'Erreur'; statusEl.className = 'text-sm text-red-400'; }
                    toast.error('Échec de l\'inscription');
                } finally {
                    submitBtn && (submitBtn.disabled = false);
                }
            });
        }
    }

    // Quick predict form and associated visualization removed to simplify workflow

        /**
         * Setup floating facts modal interactions
         */
        setupFactsModal() {
            const btn = document.getElementById('facts-chat-btn');
            const modal = document.getElementById('facts-modal');
            const closeBtn = document.getElementById('facts-close');
            const refreshBtn = document.getElementById('facts-refresh');
            const content = document.getElementById('facts-content');
            const status = document.getElementById('facts-status');
            if (!btn || !modal || !closeBtn || !refreshBtn) return;

            const show = () => {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                btn.setAttribute('aria-expanded', 'true');
                this.ensureFacts().then(() => this.displayRandomFact());
            };
            const hide = () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                btn.setAttribute('aria-expanded', 'false');
            };
            const escHandler = (e) => { if (e.key === 'Escape') hide(); };

            btn.addEventListener('click', () => {
                if (modal.classList.contains('hidden')) {
                    show();
                    document.addEventListener('keydown', escHandler, { once: true });
                } else {
                    hide();
                }
            });
            closeBtn.addEventListener('click', hide);
            refreshBtn.addEventListener('click', () => this.displayRandomFact());
            modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });

            // Public method for randomness
            this.displayRandomFact = () => {
                if (!this.facts.length) return;
                const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
                const line = document.createElement('div');
                line.className = 'text-green-300 text-sm leading-relaxed';
                line.textContent = `> ${fact}`;
                content.appendChild(line);
                content.scrollTop = content.scrollHeight;
                status.textContent = 'OK';
            };
        }

        async ensureFacts() {
            if (this.factsLoaded) return;
            try {
                const res = await fetch('/facts');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.facts)) {
                        this.facts = data.facts;
                    }
                }
            } catch (e) {
                console.warn('[MPGA] /facts fetch failed, using fallback', e);
            } finally {
                if (!this.facts.length) {
                    this.facts = [
                        'Fallback: The Moon is drifting away from Earth ~3.8 cm/year.',
                        'Fallback: Jupiter has the shortest day of all planets.'
                    ];
                }
                this.factsLoaded = true;
            }
        }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Restore previous application state
     */
    restoreState() {
        const state = getState();
        
        // Restore mission selection
        if (state.selectedMission) {
            const missionSelect = document.getElementById('mission-select');
            if (missionSelect) {
                missionSelect.value = state.selectedMission;
            }
        }
        
        // Note: We don't restore uploaded files for security reasons
        // Users must re-upload files after page refresh
        
        console.log('[MPGA] State restored');
    }

    /**
     * Setup state change listeners
     */
    setupStateListeners() {
        // Listen for state changes
        window.addEventListener('stateChange', (e) => {
            const { state, prevState } = e.detail;
            
            // Log state changes in development
            if (window.location.hostname === 'localhost') {
                console.log('[MPGA] State changed:', {
                    new: state,
                    prev: prevState
                });
            }
        });
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        if (this.plutoOrbit) {
            this.plutoOrbit.dispose();
        }
    }
}

// Initialize app
const app = new App();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Export for debugging in console
if (window.location.hostname === 'localhost') {
    window.MPGA = {
        app,
        state: appState,
        toast,
        getState,
        setState
    };
}
