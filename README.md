# chartBriefing v1.0

chartBriefing is a specialized utility designed for flight simulation enthusiasts. It transforms complex, data-heavy approach plates into a clean, actionable, MCDU-style interface using Google Gemini AI.

## Key Features

### 1. AI-Powered Extraction
* Intelligent Parsing: Automatically extracts critical data (Frequencies, Courses, Decision Altitudes, and Missed Approach procedures) from uploaded PDF charts.
* Procedure Specific: Validates if the requested approach (ILS, RNAV, VOR, etc.) exists in the uploaded document before processing.

### 2. Vertical Descent Profile
* Dynamic SVG Graph: Visualizes the approach path with smart Y-axis scaling based on waypoint altitudes.
* Configuration Cues: Automatically suggests Flaps and Gear extension points based on altitude and approach segment.
* Staggered Labels: Advanced SVG logic prevents waypoint text overlap in high-density approach segments.

### 3. MCDU-Style Data Viewer
* Authentic UI: Data is presented in a classic Flight Management Computer (FMC/MCDU) layout for high immersion during simulation.

### 4. Real-Time Weather Integration
* Live METAR: Fetches real-time weather via the AVWX API.
* Flight Rules Coding: Color-coded indicators for VFR, MVFR, IFR, and LIFR conditions.
* Hazard Detection: Extracts RVR, Cloud Layers, and Weather Phenomena (Mist, Rain, etc.).

## Installation and Setup

1. Access the app at [https://aakarshanbasubhardwaj.github.io/chartsBriefing/](https://aakarshanbasubhardwaj.github.io/chartsBriefing/)

2. API Configuration
   This app requires two API keys to function. These are stored locally in your browser for security:
   * Google Gemini API Key: Obtain from [Google AI Studio](https://aistudio.google.com/).
   * AVWX API Key: Obtain from [AVWX](https://account.avwx.rest/getting-started).

## How to Use

1. Select Airframe: Choose your aircraft type to set the correct Category (A-D) and Vat speeds.
2. Enter Destination: Input the 4-letter ICAO code and hit Enter to fetch live weather.
3. Upload Chart: Drag and drop a PDF approach plate (AIP or ChartFox).
4. Target Approach: Select the specific approach type from the dropdown.
5. Extract: Hit Extract Data with AI to generate your briefing.

## Design Philosophy: The Lifted Dashboard

* Compact Controls: Settings are organized into a 2-column grid to maximize vertical space.
* High Contrast: Designed for low-light cockpit environments using a deep-space grey and emerald palette.
* Responsive: Fully functional on tablets (iPad/Android) used as side-displays in home cockpits.

## Disclaimer

FOR FLIGHT SIMULATION USE ONLY. This tool is provided for entertainment purposes. The AI extraction may occasionally misinterpret data. Always cross-check extracted values with official aeronautical publications before use in a flight simulator. Never use this application for real-world navigation.

## Roadmap (v2.0)
* Runway Specificity: Targeted extraction for specific runway numbers.
* PDF Side-Preview: View the source chart alongside the extracted data.
* Virtual First Officer: Voice-narrated approach briefings using Web Speech API.
* Session Persistence: Auto-save your last briefing via LocalStorage.

Developed for the Flight Sim Community.