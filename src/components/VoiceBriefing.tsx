import { useState, useRef, useEffect } from 'react';

interface Props {
    data: any;
}

const NATO_PHONETIC: Record<string, string> = {
    A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
    F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet',
    K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
    P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
    U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu'
};

export default function VoiceBriefing({ data }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup audio if component unmounts mid-briefing
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Formats ICAO (e.g., "VIKN" -> "Victor India Kilo November")
    const formatICAO = (icao: string) => {
        if (!icao) return "destination";
        return icao.split('').map(char => NATO_PHONETIC[char.toUpperCase()] || char).join(' ');
    };

    const formatProcedure = (proc: string) => {
        if (!proc) return "selected approach";
        let spokenProc = proc
            .replace(/ILS/gi, 'I L S')
            .replace(/RNAV/gi, 'R-NAV')
            .replace(/VOR/gi, 'V O R')
            .replace(/NDB/gi, 'N D B')
            .replace(/Rwy/gi, 'Runway')
            .replace(/RWY/gi, 'Runway')
            .replace(/\bCAT III\b/gi, 'Cat 3')
            .replace(/\bCAT II\b/gi, 'Cat 2')
            .replace(/\bCAT I\b/gi, 'Cat 1');;

        // Find runway numbers and space them out (27 -> 2 7) so TTS doesn't say "twenty-seven"
        spokenProc = spokenProc.replace(/\b(\d{2,3})\b/g, match => match.split('').join(' '));
        return spokenProc;
    };

    const formatFrequency = (freq: string) => {
        if (!freq) return "not published";
        let cleanFreq = freq.replace('.', ' decimal ');
        // Space out every digit so Deepgram reads them individually
        return cleanFreq.split('').map(c => (/\d/.test(c) ? c + ' ' : c)).join('').replace(/  +/g, ' ');
    };

    const formatCourse = (crs: string) => {
        if (!crs) return "not published";
        let cleanCrs = crs.replace('°', '').replace(/[^0-9]/g, ''); // strip symbols
        return cleanCrs.split('').join(' ') + ' degrees';
    };

    const formatMissedApproach = (ma?: string) => ma ? ma.replace(/(\d+)/g, "$1 ") : "Climb and maintain as published";

    const generateBriefingScript = () => {
        if (!data) return "";

        const airport = formatICAO(data.airport);
        const procedure = formatProcedure(data.procedure);
        const freq = formatFrequency(data.freq);
        const course = formatCourse(data.course);
        const transAlt = data.transAlt ? `${data.transAlt.replace(/[^0-9]/g, '')} feet` : "not published";
        const tdze = data.TDZE ? `${data.TDZE.replace(/[^0-9]/g, '')} feet` : "not published";
        const minimums = data.da ? `${data.da.replace(/[^0-9]/g, '')} feet` : "not published";
        const category = data.approachCat ? data.approachCat.replace(/I/g, '1').replace(/II/g, '2').replace(/III/g, '3') : "";

        let rawScript = `
        Approach briefing for ${airport}. 
        Cleared for the ${procedure}.
        Primary frequency, ${freq}.
        Final approach course, ${course}.
        Transition altitude is ${transAlt}.
        Decision altitude is ${minimums}.
        Approach category ${category}.
        Touchdown zone elevation is ${tdze}.
        Missed approach procedure: ${formatMissedApproach(data.missedApp)}.
        Briefing complete.
    `;
    return rawScript
            .replace(/9/g, 'niner ')
            .replace(/5/g, 'fife ')
            .replace(/3/g, 'tree ');


    };

    const toggleSpeech = async () => {
        // If it's already playing, STOP it.
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        const apiKey = localStorage.getItem('deepgram_api_key');
        if (!apiKey) {
            alert("Please add your Deepgram API Key in settings for premium voice briefings.");
            return;
        }

        setIsLoading(true);
        const script = generateBriefingScript();

        try {
            // Call Deepgram's Aura TTS API
            // 'aura-asteria-en' is a great, clear female voice. 
            // 'aura-orion-en' is a great deep male voice.
            // aura-2-athena-en
            const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-2-athena-en", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: script })
            });

            if (!response.ok) throw new Error("Deepgram API Error");

            // Convert the response stream into a playable audio blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create and play the audio
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl); // Clean up memory
            };

            audio.play();
            setIsPlaying(true);

        } catch (error) {
            console.error("Audio generation failed:", error);
            alert("Failed to generate voice briefing.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleSpeech}
            disabled={isLoading}
            className={`text-[10px] font-mono flex items-center gap-2 transition-colors ${isLoading ? "text-gray-500 cursor-not-allowed"
                : isPlaying ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]"
                    : "text-gray-600 hover:text-white"
                }`}
        >
            {'<'} {isLoading ? 'CONNECTING...' : isPlaying ? 'STOP BRIEFING' : 'PLAY BRIEFING'}
            {isPlaying && <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full animate-pulse ml-1"></span>}
        </button>
    );
}