# Voice Translator App

A Progressive Web App (PWA) that translates voice input between Japanese and English using push-to-talk functionality.

## Features

- **Push-to-Talk**: Hold the microphone button to record your voice
- **Bidirectional Translation**: Switch between Japanese → English and English → Japanese
- **Speech Recognition**: Uses Web Speech API for voice input
- **Text-to-Speech**: Automatically plays the translated audio
- **PWA Support**: Install on your mobile device for app-like experience
- **Mobile-First Design**: Optimized for mobile devices
- **Offline Capable**: Basic functionality works offline (PWA cached)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Speech Recognition**: Web Speech API (browser built-in)
- **Translation**: MyMemory API (free translation service, no API key required)
- **Text-to-Speech**: Web Speech Synthesis API
- **PWA**: Service Worker, Web App Manifest

## Setup Instructions

### 1. Generate App Icons

Before deploying, you need to generate the app icons:

1. Open `generate-icons.html` in your web browser
2. Click the download buttons to save both icons:
   - `icon-192.png`
   - `icon-512.png`
3. Save them in the same folder as your other app files

### 2. Local Testing

You can test the app locally, but it requires HTTPS for full functionality:

#### Option A: Using Python (Simple)
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option B: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000

# Then open: http://localhost:8000
```

### 3. Deployment Options

#### Option A: GitHub Pages (Free)

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select "main" branch and save
5. Your app will be available at: `https://yourusername.github.io/repository-name/`

#### Option B: Netlify (Free)

1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up for free account
3. Drag and drop your project folder
4. Your app will be deployed with a custom URL

#### Option C: Vercel (Free)

1. Go to [vercel.com](https://vercel.com/)
2. Sign up for free account
3. Import your project or drag and drop
4. Automatic deployment with custom URL

#### Option D: Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

## Usage Instructions

### Basic Usage

1. **Open the app** in a modern web browser (Chrome, Edge, or Safari recommended)
2. **Allow microphone access** when prompted
3. **Hold the microphone button** and speak
4. **Release the button** when done speaking
5. **View translation** and listen to the audio

### Switching Languages

- Click the language button at the top to switch between:
  - Japanese → English
  - English → Japanese

### Installing as PWA

#### On iOS (iPhone/iPad):
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

#### On Android:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Install"

## Browser Compatibility

### Full Support:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 14.5+)
- ✅ Samsung Internet

### Partial Support:
- ⚠️ Firefox (Speech recognition not supported)
- ⚠️ Opera (May have limited speech support)

### Required Browser Features:
- Web Speech API (Speech Recognition)
- Web Speech Synthesis API (Text-to-Speech)
- Service Worker (for PWA)
- Microphone access

## Troubleshooting

### Microphone Not Working
- Check browser permissions (click the lock icon in address bar)
- Ensure HTTPS connection (required for microphone access)
- Try reloading the page
- Check if another app is using the microphone

### Translation Not Working
- Check internet connection (translation requires network)
- MyMemory API may have rate limits (1000 words/day for free tier)
- Try again after a few seconds
- Check browser console for errors
- If quota exceeded, wait 24 hours or upgrade to premium API

### Speech Recognition Errors

**"No speech detected"**
- Speak louder and more clearly
- Reduce background noise
- Check microphone settings

**"Permission denied"**
- Allow microphone access in browser settings
- Reload the page and allow permission

**"Network error"**
- Check internet connection
- Try using a different network

### Audio Playback Issues
- Check device volume
- Ensure audio is not muted
- Try different browser
- Check if text-to-speech voices are installed

## API Information

### MyMemory Translation API
- **Free tier**: 1000 words per day (no API key required)
- **Public instance**: https://api.mymemory.translated.net
- **Rate limits**: 1000 words/day for anonymous usage
- **Premium tier**: Available at https://mymemory.translated.net for higher limits

**Advantages:**
- No API key or registration required
- Simple REST API
- Good translation quality
- Support for 100+ language pairs

**Limitations:**
- 1000 words per day limit for free tier
- May be slower during peak usage
- Requires internet connection

If you experience rate limiting or want to use a different service:
1. Sign up for MyMemory Premium for higher limits
2. Switch to Google Translate API (requires API key)
3. Use DeepL API (requires API key, better quality)

To use a different translation service, edit `app.js`:
```javascript
// Example: Switch to a different API
this.translationAPI = 'YOUR_API_ENDPOINT';
// Then modify the translateText() function accordingly
```

## File Structure

```
translator/
├── index.html              # Main HTML file
├── style.css               # Styling
├── app.js                  # Main JavaScript application
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for PWA
├── generate-icons.html     # Icon generator utility (HTML/Canvas)
├── generate_icons.py       # Icon generator utility (Python/Pillow)
├── icon-192.png           # App icon 192x192 (auto-generated)
├── icon-512.png           # App icon 512x512 (auto-generated)
└── README.md              # This file
```

## Privacy & Security

- All voice processing happens in your browser
- Voice data is sent to translation API for translation only
- No data is stored on servers
- Speech recognition uses browser's built-in API
- HTTPS required for microphone access

## Known Limitations

1. **Internet Required**: Translation requires internet connection
2. **Browser Support**: Speech recognition not available in all browsers
3. **Rate Limits**: Free translation API has usage limits
4. **Language Accuracy**: Translation quality depends on LibreTranslate
5. **Voice Quality**: TTS quality depends on device/browser voices

## Future Enhancements

Possible improvements:
- More language pairs
- Offline translation (using local models)
- History of translations
- Copy to clipboard functionality
- Dark mode
- Custom API key support
- Better error handling
- Translation alternatives

## License

This project is free to use and modify for personal and commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure all browser requirements are met
3. Try on a different browser/device
4. Check browser console for error messages

## Credits

- **Speech Recognition**: Web Speech API
- **Translation**: LibreTranslate (Open Source)
- **Text-to-Speech**: Web Speech Synthesis API
- **Icons**: Custom generated SVG icons

---

**Made with ❤️ for seamless voice translation**
