import { useState, useEffect } from 'react';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  // When the app loads, check if the key exists.
  useEffect(() => {
    const gemini = localStorage.getItem('gemini_api_key');
    // If there is no key, force the settings panel to open
    if (!gemini) {
      setShowSettings(true);
    }
  }, []);

  return (
    <div className="min-h-screen p-2">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white tracking-widest">chartsBriefing</h1>
        
        {/* The button to open settings at any time in the future */}
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 px-4 py-2 rounded border border-gray-600 transition-colors"
        >
          ⚙️ Settings
        </button>
      </header>
      
      {/* MAIN APP AREA */}
      <main className="max-w-5xl mx-auto">
        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : (
          <Dashboard /> // <-- Swap the placeholder box for our new Dashboard!
        )}
      </main>
    </div>
  )
}

export default App;