import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from "../constants/categories";

/**
 * Uses the Gemini API to categorize an event title.
 * @param title The title of the event.
 * @returns A promise that resolves to a category string.
 */
export async function getCategoryForTitle(title: string): Promise<string> {
  // Return a default for very short or generic titles to save API calls
  if (title.trim().length < 3) {
    return "Personal";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Categorize the following event title into one of these exact categories: ${CATEGORIES.join(", ")}. Respond with only the single, most appropriate category name. Title: "${title}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const category = response.text.trim();
    
    // Validate that the model returned one of our expected categories
    if (CATEGORIES.includes(category)) {
      return category;
    }
    
    // Fallback if the model returns something unexpected
    console.warn(`AI returned an unexpected category: ${category}`);
    return "Other"; 

  } catch (error) {
    console.error("AI categorization failed:", error);
    // Return a sensible default if the API call fails
    return "Personal"; 
  }
}