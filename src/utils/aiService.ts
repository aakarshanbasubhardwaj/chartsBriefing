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

// 1. HELPER FUNCTION: Handles the API call and intercepts 429 Rate Limits
async function generateWithFallback(genAI: GoogleGenerativeAI, contents: any[]) {
    try {
        // Primary Attempt: Gemini 3 Flash Preview
        const primaryModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        return await primaryModel.generateContent(contents);
    } catch (error: any) {
        // Check if the error message or status code explicitly mentions "429"
        if (error?.message?.includes("429") || error?.status === 429) {
            console.warn("Rate limit (429) hit on Gemini 3 Flash. Falling back to Gemini 2.5 Flash...");
            
            // Fallback Attempt: Gemini 2.5 Flash
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            return await fallbackModel.generateContent(contents);
        }
        
        // If it's a completely different error (e.g., 400 Bad Request, API key invalid), throw it immediately
        throw error;
    }
}

export async function extractChartData(file: File, apiKey: string, aircraftCategory: string, approachType: string) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

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
        "pageNumber": 1,
        "procedure": "Full name, e.g., ${approachType} Rwy 27",
        "approachCat": "Precision, APV, or Non-Precision",
        "freq": "Primary frequency",
        "course": "Final course",
        "transAlt": "Transition Alt",
        "da": "Decision Altitude for CAT ${aircraftCategory}",
        "TDZE": "Touchdown Zone Elevation",
        "waypoints": [
          {"name": "IAF", "alt": 5000},
          {"name": "IF", "alt": 3000},
          {"name": "FAF", "alt": 2000}
        ],
        "missedApp": "1-sentence summary"
      }
    `;

        const pdfPart = await fileToGenerativePart(file);

        // 2. Route the request through fallback helper
        const result = await generateWithFallback(genAI, [prompt, pdfPart]);
        const responseText = result.response.text();

        // Clean up the text just in case the AI added ```json wrapper
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("AI Extraction failed:", error);
        alert("Failed to extract data from chart. Please check the console for more details.");
        throw new Error("Failed to extract data from chart.");
        
    }
}

export async function listAvailableProcedures(file: File, apiKey: string) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `
            Analyze this PDF and identify all instrument approach procedures mentioned.
            Return ONLY a JSON array of strings representing the procedure names.
            Example: ["ILS Rwy 27L", "RNAV (GNSS) Rwy 09", "VOR Rwy 27R"]
            If none are found, return [].
        `;

        const pdfPart = await fileToGenerativePart(file);
        
        // 3. Route the procedure check through the fallback helper
        const result = await generateWithFallback(genAI, [prompt, pdfPart]);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(text) as string[];
    } catch (error) {
        console.error("AI List Extraction failed:", error);
        alert("Failed to list available procedures. Please check the console for more details.");
        throw new Error("Failed to list available procedures.");
    }
}