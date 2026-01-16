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

        // Translation API - MyMemory (free, no API key required)
        this.translationAPI = 'https://api.mymemory.translated.net/get';

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
        console.log('=== TRANSLATION DEBUG ===');
        console.log('Input text:', text);
        console.log('Text length:', text ? text.length : 0);
        console.log('Direction:', this.currentDirection);

        if (!text || text.trim() === '') {
            console.error('No text to translate');
            this.updateStatus('No text to translate', 'error');
            return;
        }

        this.updateStatus('Translating...', 'processing');
        this.translatedText.textContent = 'Translating...';

        try {
            const [sourceLang, targetLang] = this.currentDirection.split('-');

            // MyMemory API uses GET with langpair parameter
            const url = `${this.translationAPI}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

            console.log('Translation URL:', url);
            console.log('Source language:', sourceLang);
            console.log('Target language:', targetLang);

            const response = await fetch(url);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`Translation API returned status ${response.status}`);
            }

            const data = await response.json();
            console.log('Full API response:', JSON.stringify(data, null, 2));
            console.log('Response status code:', data.responseStatus);
            console.log('Response data:', data.responseData);

            // MyMemory API returns data in responseData.translatedText
            if (data.responseData && data.responseData.translatedText) {
                this.lastTranslation = data.responseData.translatedText;
                this.translatedText.textContent = data.responseData.translatedText;
                this.updateStatus('Translation complete! ✓', 'success');
                this.playBtn.disabled = false;

                console.log('✓ Translation successful:', data.responseData.translatedText);

                // Auto-play the translation
                setTimeout(() => this.speakTranslation(), 500);
            } else if (data.responseStatus === 403) {
                throw new Error('Translation quota exceeded. Please try again later.');
            } else if (data.responseStatus !== 200) {
                throw new Error(`API returned status: ${data.responseStatus}. ${data.responseDetails || ''}`);
            } else {
                throw new Error('Invalid response structure from translation API');
            }
        } catch (error) {
            console.error('✗ Translation error:', error);
            console.error('Error stack:', error.stack);
            this.updateStatus('Translation failed: ' + error.message, 'error');
            this.translatedText.textContent = 'Error: ' + error.message;

            // Fallback: Show error in API status
            this.apiStatus.textContent = '⚠️ ' + error.message;
            this.apiStatus.style.color = '#E74C3C';
        }
        console.log('=== END TRANSLATION DEBUG ===');
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
            // Test MyMemory API with a simple translation
            const response = await fetch(`${this.translationAPI}?q=test&langpair=en|ja`);
            if (response.ok) {
                const data = await response.json();
                if (data.responseStatus === 200) {
                    this.apiStatus.textContent = '✓ Translation service ready (MyMemory API)';
                    this.apiStatus.style.color = '#50C878';
                } else {
                    this.apiStatus.textContent = '⚠️ Translation service may be slow';
                    this.apiStatus.style.color = '#E67E22';
                }
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
