import { useState, useEffect } from 'react';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  // When the app loads, check if the keys exist.
  useEffect(() => {
    const gemini = localStorage.getItem('gemini_api_key');
    const weather = localStorage.getItem('weather_api_key');
    const deepgram = localStorage.getItem('deepgram_api_key');

    // If there are missing keys, force the settings panel to open
    if (!gemini || !weather || !deepgram) {
      setShowSettings(true);
    }
  }, []);

  return (
    <div className="min-h-screen p-2 relative">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white tracking-widest">chartsBriefing</h1>
        
        {/* The button to open settings at any time */}
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 px-4 py-2 rounded border border-gray-600 transition-colors"
        >
          ⚙️ Settings
        </button>
      </header>
      
      {/* MAIN APP AREA */}
      <main className="max-w-5xl mx-auto">
        {/* 1. Dashboard is ALWAYS rendered now, so it never loses its state! */}
        <Dashboard /> 
      </main>

      {/* SETTINGS OVERLAY (MODAL) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            {/* The Settings Panel */}
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App;