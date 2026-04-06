import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { fetchMetar, type WeatherData } from '../utils/weatherService'; // Import our service
import { extractChartData, listAvailableProcedures } from '../utils/aiService';
import MCDUCard from './MCDUCard';
import VerticalProfile from './VerticalProfile';
import PDFPreview from './PDFPreview';

const aircraftOptions = [
    { id: 'c172', name: 'Cessna 152 / 172', cat: 'A', speed: '< 91 kts' },
    { id: 'tbm', name: 'Daher TBM 930', cat: 'B', speed: '91-120 kts' },
    { id: 'atr', name: 'ATR 42 / 72', cat: 'B', speed: '91-120 kts' },
    { id: 'a320', name: 'Airbus A320 Family', cat: 'C', speed: '121-140 kts' },
    { id: 'b737', name: 'Boeing 737 Family', cat: 'C', speed: '121-140 kts' },
    { id: 'a330', name: 'Airbus A330 / A350', cat: 'D', speed: '141-165 kts' },
    { id: 'b777', name: 'Boeing 777 / 787', cat: 'D', speed: '141-165 kts' },
    { id: 'b747', name: 'Boeing 747', cat: 'D', speed: '141-165 kts' },
];

export default function Dashboard() {
    const [selectedAircraft, setSelectedAircraft] = useState(aircraftOptions[3]);
    const [file, setFile] = useState<File | null>(null);

    // New States for Weather
    const [icao, setIcao] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    const [availableProcedures, setAvailableProcedures] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);



    // Handle PDF Drop
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);

            // Trigger Pre-Scan
            setIsScanning(true);
            try {
                const geminiKey = localStorage.getItem('gemini_api_key');
                const list = await listAvailableProcedures(selectedFile, geminiKey!);
                setAvailableProcedures(list);
                if (list.length === 0) setExtractError("No valid approach charts found in this PDF.");
            } catch (err) {
                setExtractError("Failed to index the PDF.");
            }
            setIsScanning(false);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
    });

    const handleAircraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const plane = aircraftOptions.find(p => p.id === e.target.value);
        if (plane) setSelectedAircraft(plane);
    };

    // --- THE WEATHER FETCHER FUNCTION ---
    const handleFetchWeather = () => performWeatherFetch(icao);

    const [isExtracting, setIsExtracting] = useState(false);
    const [chartData, setChartData] = useState<any>(null);

    const [approachType, setApproachType] = useState("");

    const [extractError, setExtractError] = useState<string | null>(null);

    const handleExtract = async () => {
        if (!file || !approachType) return;
        const geminiKey = localStorage.getItem('gemini_api_key');
        if (!geminiKey) return alert("Missing Gemini API Key!");

        setExtractError(null);
        setIsExtracting(true);
        try {
            const data = await extractChartData(file, geminiKey, selectedAircraft.cat, approachType);

            // CHECK FOR AI-GENERATED ERROR
            if (data.error) {
                setExtractError(data.error);
                setChartData(null);
            } else {
                setChartData(data);
                // AUTO-WEATHER FIX:
                if (data.airport && data.airport !== "N/A") {
                    setIcao(data.airport); // Updates the text box UI
                    performWeatherFetch(data.airport); // Fetches weather for the NEW ICAO immediately
                }
            }

        } catch (err) {
            console.error(err);
        }
        setIsExtracting(false);
    };

    const performWeatherFetch = async (icao: string) => {

        if (icao.length !== 4) return alert("Please enter a valid 4-letter ICAO code.");

        const apiKey = localStorage.getItem('weather_api_key');
        if (!apiKey) return alert("Missing Weather API Key! Please add it in Settings.");

        setLoadingWeather(true);
        const data = await fetchMetar(icao, apiKey);
        if (data) {
            setWeather(data);
        } else {
            alert("Could not fetch weather. Check your ICAO or API key.");
        }
        setLoadingWeather(false);

    };

    // 1. On Mount: Load data from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('last_briefing');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setChartData(parsed.chartData);
            setIcao(parsed.icao);
            setWeather(parsed.weather);
        }
    }, []);

    // 2. On Data Change: Save to localStorage
    useEffect(() => {
        if (chartData) {
            const session = {
                chartData,
                icao,
                weather,
                timestamp: Date.now()
            };
            localStorage.setItem('last_briefing', JSON.stringify(session));
        }
    }, [chartData, weather, icao]);

    const handleReset = () => {
        // 1. Reset React States
        setChartData(null);
        setWeather(null);
        setIcao('');
        setFile(null);
        setApproachType('');
        setAvailableProcedures([]);
        setExtractError(null);

        // 2. Clear localStorage (but keep API keys)
        localStorage.removeItem('last_briefing');
    };


    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LEFT COLUMN: Controls */}
            <div className="md:col-span-1 space-y-3">

                {/* 1. Aircraft Selector */}
                <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-white font-bold mb-3">Airframe</h3>
                    <select
                        value={selectedAircraft.id}
                        onChange={handleAircraftChange}
                        className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        {aircraftOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="mt-3 flex justify-between text-sm">
                        <span className="text-xl text-mcdu-text">CAT {selectedAircraft.cat}</span>
                        <span className="text-gray-400">
                            V<sub className="text-[10px] ml-0.5">at</sub> : {selectedAircraft.speed}
                        </span>
                    </div>
                </div>

                {/* 2. Destination Weather */}
                <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-white font-bold mb-3">Destination ICAO</h3>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. VABB"
                            value={icao}
                            onChange={(e) => setIcao(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFetchWeather();
                                }
                            }}
                            className="w-2/3 bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono uppercase placeholder:normal-case focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleFetchWeather}
                            className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors disabled:bg-gray-600"
                            disabled={loadingWeather}
                        >
                            {loadingWeather ? '...' : 'GET'}
                        </button>
                    </div>
                </div>

                {/* 3. PDF Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`relative p-8 text-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-900 hover:border-gray-400'
                        }`}
                >
                    <input {...getInputProps()} />

                    {file ? (
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">📄</div>
                            <div className="flex items-center gap-2 max-w-full">
                                <span className="text-green-400 font-bold truncate px-2 text-sm">
                                    {file.name}
                                </span>
                                {/* THE CROSS BUTTON */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        setChartData(null);
                                    }}
                                    className="p-1 hover:bg-red-900/40 rounded-full text-red-400 transition-colors"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-4xl mb-3">📄</div>
                            <div className="text-gray-300">
                                <span className="font-bold text-blue-400">Click to upload</span> or drag and drop
                                <p className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-tighter">
                                    AIP PDF or ChartFox PDF
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dismissible Error Message */}
                {extractError && (
                    <div className="bg-red-950/30 border border-red-500/50 p-3 rounded-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-2">
                            <span className="text-red-400 text-xs mt-0.5">⚠️</span>
                            <p className="text-[10px] text-red-200 font-bold leading-tight">
                                {extractError}
                            </p>
                        </div>

                        {/* DISMISS BUTTON */}
                        <button
                            onClick={() => setExtractError(null)}
                            className="text-red-500/50 hover:text-red-400 transition-colors p-1"
                            title="Dismiss Alert"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-white font-bold mb-3 ">
                        Target Procedure
                    </h3>

                    <select
                        value={approachType}
                        onChange={(e) => setApproachType(e.target.value)}
                        disabled={isScanning || availableProcedures.length === 0}
                        className="w-full bg-gray-800 border border-gray-600 rounded p-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    >
                        {isScanning ? (
                            <option>Extracting Procedures...</option>
                        ) : availableProcedures.length > 0 ? (
                            <>
                                <option value="">-- SELECT FROM CHART --</option>
                                {availableProcedures.map((proc, idx) => (
                                    <option key={idx} value={proc}>{proc}</option>
                                ))}
                            </>
                        ) : (
                            <option>UPLOAD A CHART TO START</option>
                        )}
                    </select>
                </div>
                {/* Process Button */}

                <button
                    onClick={handleExtract}
                    // Button is disabled until BOTH a file is uploaded AND an approach is selected
                    disabled={!file || !approachType || isExtracting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-black tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    {isExtracting ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                            ANALYZING PDF...
                        </>
                    ) : (
                        "Extract Data with AI"
                    )}
                </button>

                <button
                    onClick={handleReset}
                    className="sm:col-span-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg font-bold text-[10px] tracking-widest transition-all border border-gray-700 flex items-center justify-center gap-2 mt-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    CLEAR DATA
                </button>
            </div>

            {/* RIGHT COLUMN: The Data Viewer */}
            <div className="md:col-span-2 space-y-6">

                {/* WEATHER DISPLAY COMPONENT */}
                {weather && (
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="flex justify-between items-center text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-700 pb-2">
                            <span>Live Weather Data</span>
                            <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800 normal-case tracking-normal">
                                {weather.raw.split(' ')[1]}
                            </span>
                        </h3>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {/* COLUMN 1: QNH */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase">
                                    QNH <span className="normal-case">(hPa/inHg)</span>
                                </p>
                                <p className="text-2xl font-mono text-mcdu-text font-bold">
                                    {weather.qnhHpa}<span className="text-sm text-gray-400 normal-case">/{weather.qnhInhg}</span>
                                </p>
                            </div>

                            {/* COLUMN 2: Temp / Dew */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Temp</p>
                                <p className="text-2xl font-mono text-mcdu-text font-bold">
                                    {weather.temp}°C
                                </p>
                            </div>

                            {/* COLUMN 3: Wind */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Wind</p>
                                <p className="text-2xl font-mono text-mcdu-text font-bold">{weather.wind}</p>
                            </div>

                            {/* COLUMN 4: Conditions */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Conditions</p>
                                <div className="flex flex-row space-x-2 items-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-center text-white ${weather.flightRules === 'VFR' ? 'bg-green-600' :
                                        weather.flightRules === 'MVFR' ? 'bg-blue-600' :
                                            weather.flightRules === 'IFR' ? 'bg-red-600' :
                                                'bg-purple-600'
                                        }`}>
                                        {weather.flightRules}
                                    </span>
                                    <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs font-mono border border-gray-600 normal-case">
                                        Vis: {weather.visibility}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* NEW: HAZARDS & DETAILS ROW */}
                        {(weather.wxCodes.length > 0 || weather.clouds.length > 0 || weather.rvr.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-3 border-t border-gray-800 pt-3">
                                {/* Display Weather Phenomena (e.g., Mist) */}
                                {weather.wxCodes.map((wx, idx) => (
                                    <span key={`wx-${idx}`} className="bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-1 rounded text-xs font-bold">
                                        🌦️ {wx}
                                    </span>
                                ))}

                                {/* Display Cloud Layers */}
                                {weather.clouds.map((cloud, idx) => (
                                    <span key={`c-${idx}`} className="bg-gray-800 text-gray-300 border border-gray-600 px-2 py-1 rounded text-xs font-mono">
                                        ☁️ {cloud}
                                    </span>
                                ))}

                                {/* Display RVR if available */}
                                {weather.rvr.map((rvr, idx) => (
                                    <span key={`rvr-${idx}`} className="bg-orange-900/50 text-orange-300 border border-orange-700 px-2 py-1 rounded text-xs font-mono font-bold">
                                        RVR {rvr}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="text-xs text-gray-500 font-mono bg-black p-2 rounded break-words normal-case mt-1">
                            {weather.raw}
                        </p>
                    </div>
                )}

                {/* CHART DATA PLACEHOLDER */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg min-h-[400px] relative overflow-hidden">
                    {!chartData && !isExtracting ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 py-20">
                            <div className="text-5xl mb-4 opacity-20">✈️</div>
                            <p className="text-xl mb-2">Awaiting AI Briefing</p>
                            <p className="text-sm">Upload a PDF chart and click extract to generate your MCDU data.</p>
                        </div>
                    ) : isExtracting ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="text-blue-400 font-mono text-sm animate-pulse">READING CHART...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-500">
                            {/* <MCDUCard data={chartData} />
                            <VerticalProfile data={chartData} /> */}
                            <div className="max-w-2xl mx-auto space-y-8 w-full">
                                {chartData ? (
                                    <>
                                        {/* <VoiceBriefing data={chartData} /> */}
                                        <MCDUCard data={chartData} />
                                        <VerticalProfile data={chartData} />
                                        <div className="w-full pt-8 border-t border-gray-800">
                                            {/* Divider Line */}
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <div className="h-px bg-gray-800 flex-grow"></div>
                                                <h3 className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">
                                                    Reference Chart Source
                                                </h3>
                                                <div className="h-px bg-gray-800 flex-grow"></div>
                                            </div>

                                            {/* The PDF Component */}
                                            <PDFPreview
                                                file={file}
                                                pageNumber={chartData.pageNumber || 1}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* Placeholder when no data */
                                    <div className="bg-gray-900 p-10 rounded-xl border border-gray-700 text-center opacity-50">
                                        <p className="text-gray-500 font-mono">AWAITING CHART UPLOAD</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}