import { useState, useEffect } from 'react';

// We add an "onClose" property here so the App can tell it to close
export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [weatherKey, setWeatherKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini_api_key');
    const savedWeather = localStorage.getItem('weather_api_key');
    if (savedGemini) setGeminiKey(savedGemini);
    if (savedWeather) setWeatherKey(savedWeather);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('weather_api_key', weatherKey);
    setSaved(true);
    
    // Wait 1 second so they see the "Saved!" text, then close the panel
    setTimeout(() => {
      setSaved(false);
      onClose(); 
    }, 1000); 
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-900 rounded-xl shadow-lg border border-gray-700 mt-10 relative">
      {/* Optional: Add an X button in the top right to cancel/close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

      <h2 className="text-xl font-bold mb-4 text-white">✈️ chartsBriefing Settings</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your API keys are stored securely in your browser's local storage. They never leave your device.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Google Gemini API Key
        </label>
        <input
          type="password"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
        />
        <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
          Get a free Gemini key
        </a>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          AVWX API Key
        </label>
        <input
          type="password"
          value={weatherKey}
          onChange={(e) => setWeatherKey(e.target.value)}
          placeholder="Optional..."
          className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {saved ? 'Keys Saved! ✓' : 'Save Configuration'}
      </button>
    </div>
  );
}