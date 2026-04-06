# chartBriefing v2.0

chartBriefing is a specialized utility designed for flight simulation enthusiasts. It transforms complex, data-heavy approach plates into a clean, actionable, MCDU-style interface using Google Gemini AI.

## Key Features

### 1. AI-Powered Extraction
* **Intelligent Parsing:** Automatically extracts critical data (Frequencies, Courses, Decision Altitudes, and Missed Approach procedures) from uploaded PDF charts.
* **Auto-Fallback Routing:** Automatically seamlessly switches to fallback AI models if API rate limits are hit, ensuring uninterrupted briefings.

### 2. Interactive PDF Viewer
* View the source chart alongside the extracted data. Features smooth zooming, free-panning, and exact scaling using modern React rendering.

### 3. Virtual First Officer (Audio Briefings)
* **Premium Voice Engine:** Powered by Deepgram Aura TTS.
* **Aviation Phraseology:** Automatically formats text to use proper NATO phonetics, runway spacing, and aviation numbering (e.g., "niner", "tree", "fife") for hyper-realistic audio briefings.

### 4. Vertical Descent Profile
* **Dynamic SVG Graph:** Visualizes the approach path with smart Y-axis scaling based on waypoint altitudes.
* **Configuration Cues:** Automatically suggests Flaps and Gear extension points based on altitude and approach segment.

### 5. MCDU-Style Data Viewer
* **Authentic UI:** Data is presented in a classic Flight Management Computer (FMC/MCDU) layout for high immersion during simulation.

### 6. Real-Time Weather Integration
* **Live METAR:** Fetches real-time weather via the AVWX API.
* **Flight Rules Coding:** Color-coded indicators for VFR, MVFR, IFR, and LIFR conditions.

## Installation and Setup

1. Access the app at [https://aakarshanbasubhardwaj.github.io/chartsBriefing/](https://aakarshanbasubhardwaj.github.io/chartsBriefing/)

2. **API Configuration**
   This app requires API keys to function. These are stored locally and securely in your browser's memory:
   * **Google Gemini API Key:** Obtain from [Google AI Studio](https://aistudio.google.com/).
   * **AVWX API Key:** Obtain from [AVWX](https://account.avwx.rest/getting-started).
   * **Deepgram API Key (Optional, for Voice):** Obtain from [Deepgram](https://console.deepgram.com/).

## How to Use

1. **Select Airframe:** Choose your aircraft type to set the correct Category (A-D) and Vat speeds.
2. **Enter Destination:** Input the 4-letter ICAO code and hit Enter to fetch live weather.
3. **Upload Chart:** Drag and drop a PDF approach plate (AIP or Navigraph/ChartFox).
4. **Target Approach:** Select the specific approach type from the dropdown.
5. **Extract & Brief:** Hit Extract Data to generate your briefing, then click "PLAY BRIEFING" on the MCDU to hear your the approach briefing.

## Design Philosophy

* **Compact Controls**: Settings are organized into a 2-column grid to maximize vertical space.
* **High Contrast:** Designed for low-light cockpit environments using a deep-space grey, cyan, and emerald palette.
* **Responsive:** Fully functional on tablets (iPad/Android) used as side-displays in home cockpits.

## Disclaimer

**FOR FLIGHT SIMULATION USE ONLY.** This tool is provided for entertainment purposes. The AI extraction may occasionally misinterpret data. Always cross-check extracted values with official aeronautical publications before use in a flight simulator. Never use this application for real-world navigation.

## Roadmap (v2.1 - Quality of Life)
* **Smart Caching:** LocalStorage caching to prevent re-extracting the same PDF and save on API tokens.
* **ATC Scratchpad:** A quick-access digital notepad for copying IFR clearances from VATSIM/IVAO.

Developed for the Flight Sim Community.