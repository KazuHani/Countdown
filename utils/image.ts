/**
 * Converts a File object to a base64 string, stripping the data URL prefix.
 * This is necessary for sending image data to the Gemini API.
 * @param file The file to convert.
 * @returns A promise that resolves with the raw base64 data string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // The result includes the "data:image/jpeg;base64," prefix, which we need to strip
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        reject(new Error("Failed to parse base64 data from file."));
      } else {
        resolve(base64Data);
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a File object to a data URL string.
 * This is used to display image previews in the UI (e.g., for <img> src attributes).
 * @param file The file to convert.
 * @returns A promise that resolves with the full data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
