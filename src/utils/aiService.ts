import { GoogleGenerativeAI } from "@google/generative-ai";

async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

export async function extractChartData(file: File, apiKey: string, aircraftCategory: string, approachType: string) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. We remove the 'systemInstruction' line from here to avoid the 400 error.
        const model = genAI.getGenerativeModel(
            { model: "gemini-3-flash-preview" },
        );

        // 2. We put the "Expert Flight Instructor" instructions directly at the start of the prompt.
        const prompt = `
      You are an expert aviation flight instructor. 
      Analyze this PDF. It may contain multiple approach charts.

      The user is flying a Category ${aircraftCategory} aircraft.
      
      CRITICAL INSTRUCTION: Focus ONLY on the "${approachType}" approach chart. 
      Ignore other charts in the document (e.g., if the user asked for ILS, ignore VOR or RNP charts).
      If the PDF DOES NOT contain a chart for a "${approachType}" approach, 
      return ONLY this JSON object: {"error": "The uploaded PDF does not appear to contain a ${approachType} approach chart. Please check the file and try again."}.
      If it IS found, Return a strictly formatted JSON object. If a value is not found, use "N/A".
      
      {
        "airport": "4 letter ICAO code",
        "procedure": "Full name, e.g., ${approachType} Rwy 27",
        "approachCat": "Precision, APV, or Non-Precision",
        "freq": "Primary frequency",
        "course": "Final course",
        "transAlt": "Transition Alt",
        "da": "Decision Altitude for CAT ${aircraftCategory}",
        "waypoints": [
          {"name": "IAF", "alt": 5000},
          {"name": "IF", "alt": 3000},
          {"name": "FAF", "alt": 2000}
        ],
        "missedApp": "1-sentence summary"
      }
    `;

        const pdfPart = await fileToGenerativePart(file);

        // Generate the content
        const result = await model.generateContent([prompt, pdfPart]);
        const responseText = result.response.text();

        // Clean up the text just in case the AI added ```json wrapper
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("AI Extraction failed:", error);
        throw new Error("Failed to extract data from chart.");
    }
}

export async function listAvailableProcedures(file: File, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Analyze this PDF and identify all instrument approach procedures mentioned.
    Return ONLY a JSON array of strings representing the procedure names.
    Example: ["ILS Rwy 27L", "RNAV (GNSS) Rwy 09", "VOR Rwy 27R"]
    If none are found, return [].
  `;

  const pdfPart = await fileToGenerativePart(file);
  const result = await model.generateContent([prompt, pdfPart]);
  const response = await result.response;
  const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(text) as string[];
}