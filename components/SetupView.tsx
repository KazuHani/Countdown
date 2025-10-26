import React, { useState } from 'react';
import { EventDetails } from '../types';
import { TIMEZONES } from '../constants/timezones';
import { getTargetDate } from '../utils/calendar';
import { getCategoryForTitle, getEventDetailsFromImage } from '../utils/ai';
import { LocationIcon } from './icons/LocationIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { fileToBase64, fileToDataUrl } from '../utils/image';


type EventFormData = Omit<EventDetails, 'id'>;

interface SetupViewProps {
  onSave: (details: EventFormData) => void;
  onCancel: () => void;
  eventToEdit?: EventDetails;
  categories: string[];
}

export const SetupView: React.FC<SetupViewProps> = ({ onSave, onCancel, eventToEdit, categories }) => {
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [date, setDate] = useState(eventToEdit?.date || '');
  const [time, setTime] = useState(eventToEdit?.time || '');
  const [timezone, setTimezone] = useState(eventToEdit?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'local');
  const [backgroundImage, setBackgroundImage] = useState(eventToEdit?.backgroundImage || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleDetectTimezone = () => {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTz);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size cannot exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
        setError(null); // Clear previous errors
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      }
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setAnalysisError("Image for analysis cannot exceed 5MB.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const [base64Data, dataUrl] = await Promise.all([
        fileToBase64(file),
        fileToDataUrl(file),
      ]);
      
      const details = await getEventDetailsFromImage(base64Data, file.type);

      if (details) {
        if (details.title) setTitle(details.title);
        if (details.date) setDate(details.date);
        if (details.time) setTime(details.time);
        setBackgroundImage(dataUrl); // Use the uploaded image as background
      } else {
        setAnalysisError("Could not extract details from the image. Please fill them in manually.");
      }
    } catch (err) {
      console.error(err);
      setAnalysisError("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
      // Clear the file input so the same file can be selected again
      e.target.value = ''; 
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isAnalyzing) return;

    if (!title || !date || !time) {
      setError('Title, date, and time fields are required.');
      return;
    }

    const tempDetails = { title, date, time, timezone, id: '' };
    const targetDate = getTargetDate(tempDetails);
    
    const now = new Date();
    // Set seconds and milliseconds of 'now' to 0 to compare at the minute-level.
    // This allows creating an event for the current minute without it being flagged as "in the past".
    now.setSeconds(0, 0);

    if (targetDate.getTime() < now.getTime() && !eventToEdit) {
      setError('The selected date and time must be in the future.');
      return;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      const category = (eventToEdit && eventToEdit.title === title && eventToEdit.category)
        ? eventToEdit.category
        : await getCategoryForTitle(title, categories);

      const finalDetails: EventFormData = { title, date, time, timezone, backgroundImage, category };
      onSave(finalDetails);
    } catch (err) {
      console.error(err);
      // Save anyway with a default category
      const fallbackCategory = eventToEdit?.category || 'Personal';
      const finalDetails: EventFormData = { title, date, time, timezone, backgroundImage, category: fallbackCategory };
      onSave(finalDetails);
    } finally {
      setIsSaving(false);
    }
  };
  
  const allDisabled = isSaving || isAnalyzing;

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-cyan-400">{eventToEdit ? 'Edit Countdown' : 'Create a New Countdown'}</h1>
      
      <div className="pt-6 text-center">
         <div className="relative">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-700/60" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-gray-800 px-3 text-lg font-medium text-gray-300">Create with AI</span>
            </div>
        </div>
        <div className="mt-4">
          <label htmlFor="imageAnalysis" className="sr-only">Upload an Image for Analysis</label>
          <div className="relative">
            <input
              id="imageAnalysis"
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleAnalyzeImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={allDisabled}
            />
            <button
              type="button"
              className="w-full py-3 px-4 border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-md font-bold text-gray-400 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={allDisabled}
              onClick={() => document.getElementById('imageAnalysis')?.click()}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Analyze Image to Auto-fill
                </>
              )}
            </button>
          </div>
          {analysisError && <p className="text-red-400 text-sm text-center mt-2">{analysisError}</p>}
        </div>
      </div>
      
       <div className="relative pt-6">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-700/60" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-gray-800 px-3 text-lg font-medium text-gray-300">Or, Enter Manually</span>
            </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="e.g., Holiday Starts"
            disabled={allDisabled}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              disabled={allDisabled}
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">Event Time</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              disabled={allDisabled}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">Timezone</label>
              <button
                type="button"
                onClick={handleDetectTimezone}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                title="Detect my timezone"
                disabled={allDisabled}
              >
                <LocationIcon className="w-4 h-4" />
                Detect
              </button>
          </div>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            disabled={allDisabled}
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
            {/* If detected timezone is not in the list, add it as an option */}
            {!TIMEZONES.some(tz => tz.value === timezone) && timezone !== 'local' && (
              <option key={timezone} value={timezone}>
                {timezone.replace(/_/g, ' ')} (Detected)
              </option>
            )}
          </select>
        </div>
         <div>
          <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-300 mb-2">Upload Background (Optional)</label>
          <input
            id="backgroundImage"
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 disabled:opacity-50"
            disabled={allDisabled}
          />
           {backgroundImage && (
            <div className="mt-4 relative">
              <img src={backgroundImage} alt="Background Preview" className="w-full h-32 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => setBackgroundImage('')}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-black/80"
                title="Remove image"
                disabled={allDisabled}
              >
                &#x2715;
              </button>
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-500 rounded-md font-bold text-white transition-colors disabled:opacity-50"
                disabled={allDisabled}
            >
                Cancel
            </button>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-all duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={allDisabled}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                eventToEdit ? 'Save Changes' : 'Save Countdown'
              )}
            </button>
        </div>
      </form>
    </div>
  );
};