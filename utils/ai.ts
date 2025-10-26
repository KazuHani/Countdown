import { GoogleGenAI } from "@google/genai";

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