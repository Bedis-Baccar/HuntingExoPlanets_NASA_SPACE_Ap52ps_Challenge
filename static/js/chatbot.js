/**
 * Chatbot Module
 * Astronomy assistant with pre-programmed knowledge about exoplanets
 */

import { getState, setState } from './state.js';

export class Chatbot {
    constructor() {
        this.modal = document.getElementById('chatbot-modal');
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.closeBtn = document.getElementById('chatbot-close');
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send');
        
        this.conversationHistory = [];
        
        // Knowledge base
        this.knowledgeBase = {
            exoplanet: {
                keywords: ['exoplanet', 'planet', 'alien world'],
                response: "An exoplanet is a planet that orbits a star outside our solar system. Over 5,000 exoplanets have been confirmed so far! They come in many types: gas giants like Jupiter, ice giants like Neptune, rocky planets like Earth, and even 'super-Earths' larger than our planet."
            },
            transit: {
                keywords: ['transit', 'method', 'detect', 'detection'],
                response: "The transit method detects exoplanets by measuring the tiny dip in a star's brightness when a planet passes in front of it. It's like a mini-eclipse! The size of the dip tells us the planet's size, and how often it happens reveals the orbital period."
            },
            kepler: {
                keywords: ['kepler', 'mission'],
                response: "The Kepler Space Telescope was NASA's first planet-hunting mission, launched in 2009. It discovered over 2,600 confirmed exoplanets by continuously monitoring 150,000 stars! Kepler revolutionized our understanding of planetary systems."
            },
            tess: {
                keywords: ['tess', 'transiting'],
                response: "TESS (Transiting Exoplanet Survey Satellite) is NASA's current planet hunter, launched in 2018. It surveys the entire sky, looking for planets around the brightest, nearest stars. TESS has found thousands of exoplanet candidates, including some potentially habitable worlds!"
            },
            habitable: {
                keywords: ['habitable', 'life', 'water', 'goldilocks'],
                response: "The 'habitable zone' is the region around a star where liquid water could exist on a planet's surface - not too hot, not too cold, just right! Scientists have found several potentially habitable exoplanets, like Proxima Centauri b, just 4.2 light-years away."
            },
            lightcurve: {
                keywords: ['light curve', 'flux', 'brightness', 'data'],
                response: "A light curve is a graph showing how a star's brightness changes over time. When analyzing exoplanet transits, we look for periodic dips in the light curve. The shape, depth, and duration of these dips reveal details about the planet's size, orbit, and even its atmosphere!"
            },
            corot: {
                keywords: ['corot'],
                response: "CoRoT (Convection, Rotation and planetary Transits) was a French-led space telescope that operated from 2006-2012. It was one of the first missions dedicated to finding exoplanets using the transit method, discovering 34 confirmed planets including some of the first rocky exoplanets ever found."
            },
            cheops: {
                keywords: ['cheops'],
                response: "CHEOPS (CHaracterising ExOPlanets Satellite) is a European Space Agency mission launched in 2019. Unlike Kepler or TESS, CHEOPS doesn't search for new planets - it studies known exoplanets in detail, measuring their sizes precisely and characterizing their properties."
            },
            jwst: {
                keywords: ['jwst', 'james webb', 'webb'],
                response: "The James Webb Space Telescope (JWST) can analyze exoplanet atmospheres by studying the starlight that passes through them during transits. It's already detected water vapor, carbon dioxide, and other molecules on distant worlds, helping us understand if they could support life!"
            },
            size: {
                keywords: ['how many', 'number', 'count'],
                response: "As of 2024, astronomers have confirmed over 5,500 exoplanets across more than 4,000 planetary systems! And there are thousands more candidates waiting to be confirmed. The Milky Way galaxy likely contains hundreds of billions of planets!"
            }
        };
        
        this.init();
    }

    /**
     * Initialize event listeners
     */
    init() {
        // Toggle modal
        this.toggleBtn.addEventListener('click', () => {
            this.open();
        });
        
        this.closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Send message
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    /**
     * Open chatbot
     */
    open() {
        this.modal.classList.remove('hidden');
        this.input.focus();
        setState({ chatbotOpen: true });
    }

    /**
     * Close chatbot
     */
    close() {
        this.modal.classList.add('hidden');
        setState({ chatbotOpen: false });
    }

    /**
     * Send message
     */
    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        
        // Get bot response
        setTimeout(() => {
            const response = this.getResponse(message);
            this.addMessage(response, 'bot');
        }, 500);
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-3';
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-space-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span>🌟</span>
                </div>
                <div class="bg-gray-700 rounded-lg p-3 max-w-md animate-fade-in">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `
                <div class="bg-space-primary rounded-lg p-3 max-w-md">
                    <p>${text}</p>
                </div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Save to history
        this.conversationHistory.push({ text, sender });
        setState({ chatHistory: this.conversationHistory });
    }

    /**
     * Get bot response based on user message
     */
    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check knowledge base
        for (const [key, knowledge] of Object.entries(this.knowledgeBase)) {
            if (knowledge.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return knowledge.response;
            }
        }
        
        // Check for greetings
        if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
            return "Hello! I'm your astronomy assistant. I can tell you about exoplanets, space missions like Kepler and TESS, the transit method, and more. What would you like to know?";
        }
        
        // Check for thanks
        if (lowerMessage.match(/\b(thanks|thank you|thx)\b/)) {
            return "You're welcome! Feel free to ask me anything else about exoplanets and space exploration! 🚀";
        }
        
        // Check if asking about the app
        if (lowerMessage.includes('app') || lowerMessage.includes('tool') || lowerMessage.includes('mpga')) {
            return "MPGA is a light curve analysis tool that helps detect exoplanets! Upload your CSV data from missions like Kepler or TESS, and I'll analyze it to look for the telltale dips in brightness that indicate a planet passing in front of a star.";
        }
        
        // Default response with suggestions
        return "I'm not sure about that specific topic, but I can help you learn about: exoplanets, the transit detection method, NASA missions (Kepler, TESS, CoRoT, CHEOPS), habitable zones, light curves, and the James Webb Space Telescope. What interests you?";
    }
}
