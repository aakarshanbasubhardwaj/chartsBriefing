export interface WeatherData {
  qnhHpa: string;
  qnhInhg: string;
  temp: string;
  wind: string;
  raw: string;
  flightRules: string;
  visibility: string;
  clouds: string[];
  wxCodes: string[];
  rvr: string[];
}

export async function fetchMetar(icao: string, apiKey: string): Promise<WeatherData | null> {
  if (!icao || !apiKey) return null;

  try {
    const response = await fetch(`https://avwx.rest/api/metar/${icao.toUpperCase()}`, {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    
    if (!response.ok) throw new Error("Weather fetch failed");
    
    const data = await response.json();
    const hpaValue = data.altimeter ? data.altimeter.value : null;
    const inhgValue = hpaValue ? (hpaValue * 0.02953).toFixed(2) : '---';

    return {
      qnhHpa: hpaValue ? hpaValue.toString() : '---',
      qnhInhg: inhgValue.toString(),
      temp: data.temperature ? data.temperature.value.toString() : '---',
      wind: data.wind_direction && data.wind_speed 
            ? `${data.wind_direction.repr}/${data.wind_speed.repr}` 
            : '---/--',
      raw: data.raw,
      flightRules: data.flight_rules || 'UNK',
      visibility: data.visibility ? data.visibility.repr : '---',
      // --- NEW UPGRADES ---
      // Multiply cloud altitude by 100 (e.g., 20 = 2000ft)
      clouds: data.clouds ? data.clouds.map((c: any) => `${c.type} @ ${c.altitude * 100}ft`) : [],
      // Extract the plain English weather phenomena
      wxCodes: data.wx_codes ? data.wx_codes.map((w: any) => w.value) : [],
      // Extract specific runway visibility limits
      rvr: data.runway_visibility ? data.runway_visibility.map((r: any) => `Rwy ${r.runway}: ${r.visibility.repr}m`) : []
    };
  } catch (error) {
    console.error("AVWX fetch failed:", error);
    return null;
  }
}