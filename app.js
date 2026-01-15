// Voice Translator App - Main JavaScript File

class VoiceTranslator {
    constructor() {
        // DOM Elements
        this.micBtn = document.getElementById('micBtn');
        this.langBtn = document.getElementById('langBtn');
        this.playBtn = document.getElementById('playBtn');
        this.status = document.getElementById('status');
        this.originalText = document.getElementById('originalText');
        this.translatedText = document.getElementById('translatedText');
        this.recordingIndicator = document.querySelector('.recording-indicator');
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
        this.apiStatus = document.getElementById('apiStatus');

        // State
        this.isRecording = false;
        this.currentDirection = 'ja-en'; // ja-en or en-ja
        this.lastTranslation = '';

        // Speech Recognition
        this.recognition = null;
        this.synthesis = window.speechSynthesis;

        // Translation API
        this.translationAPI = 'https://libretranslate.com/translate';

        // Initialize
        this.init();
    }

    init() {
        this.checkBrowserSupport();
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.updateLanguageDisplay();
        this.testTranslationAPI();

        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration failed', err));
        }
    }

    checkBrowserSupport() {
        // Check for Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.updateStatus('Speech recognition not supported in this browser', 'error');
            this.micBtn.disabled = true;
            return false;
        }

        // Check for Speech Synthesis
        if (!this.synthesis) {
            this.updateStatus('Text-to-speech not supported in this browser', 'error');
            return false;
        }

        return true;
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        // Set language based on current direction
        this.updateRecognitionLanguage();

        // Event Handlers
        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.isRecording = true;
            this.updateStatus('Listening... Speak now!', 'listening');
            this.micBtn.classList.add('recording');
            this.recordingIndicator.classList.add('active');
            this.recordingIndicator.textContent = '🔴 Recording...';
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Display interim results
            if (interimTranscript) {
                this.originalText.textContent = interimTranscript;
            }

            // Process final results
            if (finalTranscript) {
                this.originalText.textContent = finalTranscript;
                this.translateText(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Error: ';

            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone not found or permission denied.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage += 'Network error. Check your connection.';
                    break;
                default:
                    errorMessage += event.error;
            }

            this.updateStatus(errorMessage, 'error');
            this.stopRecording();
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            this.stopRecording();
        };
    }

    updateRecognitionLanguage() {
        if (!this.recognition) return;

        // Set recognition language based on source language
        if (this.currentDirection === 'ja-en') {
            this.recognition.lang = 'ja-JP';
        } else {
            this.recognition.lang = 'en-US';
        }
    }

    setupEventListeners() {
        // Push-to-talk functionality
        // Mouse events for desktop
        this.micBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startRecording();
        });

        this.micBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (this.isRecording) {
                this.recognition.stop();
            }
        });

        this.micBtn.addEventListener('mouseleave', (e) => {
            if (this.isRecording) {
                this.recognition.stop();
            }
        });

        // Touch events for mobile
        this.micBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        });

        this.micBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isRecording) {
                this.recognition.stop();
            }
        });

        this.micBtn.addEventListener('touchcancel', (e) => {
            if (this.isRecording) {
                this.recognition.stop();
            }
        });

        // Language switcher
        this.langBtn.addEventListener('click', () => {
            this.switchLanguageDirection();
        });

        // Play translated audio
        this.playBtn.addEventListener('click', () => {
            this.speakTranslation();
        });
    }

    startRecording() {
        if (!this.recognition || this.isRecording) return;

        // Clear previous results
        this.originalText.textContent = 'Listening...';
        this.translatedText.textContent = 'Translation will appear here...';
        this.playBtn.disabled = true;
        this.lastTranslation = '';

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.updateStatus('Failed to start recording. Please try again.', 'error');
        }
    }

    stopRecording() {
        this.isRecording = false;
        this.micBtn.classList.remove('recording');
        this.recordingIndicator.classList.remove('active');

        if (this.originalText.textContent === 'Listening...' || !this.originalText.textContent) {
            this.originalText.textContent = 'Your speech will appear here...';
            this.updateStatus('No speech detected. Try again.', 'error');
        }
    }

    async translateText(text) {
        if (!text || text.trim() === '') {
            this.updateStatus('No text to translate', 'error');
            return;
        }

        this.updateStatus('Translating...', 'processing');
        this.translatedText.textContent = 'Translating...';

        try {
            const [sourceLang, targetLang] = this.currentDirection.split('-');

            const response = await fetch(this.translationAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.translatedText) {
                this.lastTranslation = data.translatedText;
                this.translatedText.textContent = data.translatedText;
                this.updateStatus('Translation complete!', 'success');
                this.playBtn.disabled = false;

                // Auto-play the translation
                setTimeout(() => this.speakTranslation(), 500);
            } else {
                throw new Error('Invalid response from translation API');
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.updateStatus('Translation failed. Please try again.', 'error');
            this.translatedText.textContent = 'Translation failed. Please try again.';

            // Fallback: Show error in API status
            this.apiStatus.textContent = '⚠️ Translation service temporarily unavailable';
        }
    }

    speakTranslation() {
        if (!this.lastTranslation || this.lastTranslation === '') {
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(this.lastTranslation);

        // Set language based on target language
        const [_, targetLang] = this.currentDirection.split('-');
        utterance.lang = targetLang === 'en' ? 'en-US' : 'ja-JP';

        // Set voice parameters
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a native voice
        const voices = this.synthesis.getVoices();
        const targetVoice = voices.find(voice =>
            voice.lang.startsWith(targetLang === 'en' ? 'en' : 'ja')
        );
        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        // Event handlers
        utterance.onstart = () => {
            this.playBtn.disabled = true;
            this.updateStatus('Playing translation...', 'processing');
        };

        utterance.onend = () => {
            this.playBtn.disabled = false;
            this.updateStatus('Ready to translate', '');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.playBtn.disabled = false;
            this.updateStatus('Audio playback failed', 'error');
        };

        this.synthesis.speak(utterance);
    }

    switchLanguageDirection() {
        // Toggle direction
        this.currentDirection = this.currentDirection === 'ja-en' ? 'en-ja' : 'ja-en';

        // Update UI
        this.updateLanguageDisplay();

        // Update recognition language
        this.updateRecognitionLanguage();

        // Clear previous results
        this.originalText.textContent = 'Your speech will appear here...';
        this.translatedText.textContent = 'Translation will appear here...';
        this.playBtn.disabled = true;
        this.lastTranslation = '';

        this.updateStatus('Language direction changed. Ready to translate.', '');
    }

    updateLanguageDisplay() {
        if (this.currentDirection === 'ja-en') {
            this.sourceLang.textContent = '🇯🇵 Japanese';
            this.targetLang.textContent = '🇬🇧 English';
        } else {
            this.sourceLang.textContent = '🇬🇧 English';
            this.targetLang.textContent = '🇯🇵 Japanese';
        }
    }

    updateStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = 'status';
        if (type) {
            this.status.classList.add(type);
        }
    }

    async testTranslationAPI() {
        try {
            const response = await fetch('https://libretranslate.com/languages');
            if (response.ok) {
                this.apiStatus.textContent = '✓ Translation service ready';
                this.apiStatus.style.color = '#50C878';
            } else {
                this.apiStatus.textContent = '⚠️ Translation service may be slow';
                this.apiStatus.style.color = '#E67E22';
            }
        } catch (error) {
            this.apiStatus.textContent = '⚠️ Translation service check failed';
            this.apiStatus.style.color = '#E74C3C';
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VoiceTranslator();
    });
} else {
    new VoiceTranslator();
}

// Load voices when they become available (some browsers load them asynchronously)
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
    };
}
