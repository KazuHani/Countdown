import { GoogleGenAI, Type } from "@google/genai";

/**
 * Uses the Gemini API to categorize an event title.
 * @param title The title of the event.
 * @param categories The list of available categories.
 * @returns A promise that resolves to a category string.
 */
export async function getCategoryForTitle(title: string, categories: string[]): Promise<string> {
  // Return a default for very short or generic titles to save API calls
  if (title.trim().length < 3) {
    return "Personal";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Categorize the following event title into one of these exact categories: ${categories.join(", ")}. Respond with only the single, most appropriate category name. Title: "${title}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const category = response.text.trim();
    
    // Validate that the model returned one of our expected categories
    if (categories.includes(category)) {
      return category;
    }
    
    // Fallback if the model returns something unexpected
    console.warn(`AI returned an unexpected category: ${category}`);
    return categories.includes("Other") ? "Other" : categories[0] || "Personal";

  } catch (error) {
    console.error("AI categorization failed:", error);
    // Return a sensible default if the API call fails
    return categories.includes("Personal") ? "Personal" : categories[0] || "Other"; 
  }
}


export interface AnalyzedEventData {
  title?: string;
  date?: string; // "YYYY-MM-DD"
  time?: string; // "HH:mm"
}

/**
 * Uses Gemini to analyze an image and extract event details.
 * @param base64Image The base64 encoded image data (without the data URL prefix).
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the extracted event data.
 */
export async function getEventDetailsFromImage(base64Image: string, mimeType: string): Promise<AnalyzedEventData | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: `Analyze this image (which could be a poster, screenshot, or invitation) and extract the event details.
      Your response MUST be a valid JSON object.
      - "title": The main title or name of the event.
      - "date": The date of the event in YYYY-MM-DD format. If the year isn't specified, assume the current year or the next logical year if the date has passed.
      - "time": The start time of the event in HH:mm (24-hour) format.
      
      If a field cannot be found, you MUST return an empty string for that key's value.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The name of the event." },
                    date: { type: Type.STRING, description: "The date in YYYY-MM-DD format." },
                    time: { type: Type.STRING, description: "The time in HH:mm format." },
                },
                required: ["title", "date", "time"]
            },
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        console.error("AI returned an empty response.");
        return null;
    }

    return JSON.parse(jsonText) as AnalyzedEventData;

  } catch (error) {
    console.error("AI image analysis failed:", error);
    return null;
  }
}