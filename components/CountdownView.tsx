import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EventDetails, TimeLeft } from '../types';
import { getTargetDate, generateGoogleCalendarUrl, generateIcsFileContent, downloadFile, calculateTimeLeft } from '../utils/calendar';
import { CalendarIcon } from './icons/CalendarIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { AppleIcon } from './icons/AppleIcon';
import { Confetti } from './Confetti';

interface CountdownViewProps {
  eventDetails: EventDetails;
  onBack: () => void;
}

const TimeCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl w-24 h-24 sm:w-32 sm:h-32 shadow-lg">
    <span className="text-4xl sm:text-6xl font-bold font-mono text-cyan-400">{String(value).padStart(2, '0')}</span>
    <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest mt-1">{label}</span>
  </div>
);

export const CountdownView: React.FC<CountdownViewProps> = ({ eventDetails, onBack }) => {
  const targetDate = useMemo(() => getTargetDate(eventDetails), [eventDetails]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const updateTimer = useCallback(() => {
    const { timeLeft: newTimeLeft, isFinished: finished } = calculateTimeLeft(targetDate);
    setTimeLeft(newTimeLeft);
    setIsFinished(finished);
  }, [targetDate]);

  useEffect(() => {
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [updateTimer]);

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.preventDefault();
    const content = generateIcsFileContent(eventDetails);
    const filename = `${eventDetails.title.replace(/ /g, '_')}.ics`;
    downloadFile(content, filename, 'text/calendar');
    setIsCalendarOpen(false);
  };

  const handleAddToGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(generateGoogleCalendarUrl(eventDetails), '_blank');
    setIsCalendarOpen(false);
  };
  
  const backgroundStyle = eventDetails.backgroundImage
    ? { backgroundImage: `url(${eventDetails.backgroundImage})` }
    : {};

  return (
    <div className="fixed inset-0 bg-gray-900 animate-fade-in">
        {isFinished && <Confetti />}
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-0" style={{...backgroundStyle, opacity: eventDetails.backgroundImage ? 1: 0 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-slate-800/70" />
        
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 truncate" title={eventDetails.title}>{eventDetails.title}</h2>
                <p className="text-gray-300 mb-8">{targetDate.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

                {isFinished ? (
                    <div className="text-5xl font-bold text-green-400 p-10 bg-gray-800/50 backdrop-blur-sm rounded-2xl animate-pop-in">
                        Finished
                    </div>
                ) : (
                    <div className="flex justify-center items-center space-x-2 sm:space-x-4">
                        {timeLeft && <TimeCard value={timeLeft.days} label="Days" />}
                        {timeLeft && <TimeCard value={timeLeft.hours} label="Hours" />}
                        {timeLeft && <TimeCard value={timeLeft.minutes} label="Minutes" />}
                        {timeLeft && <TimeCard value={timeLeft.seconds} label="Seconds" />}
                    </div>
                )}

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className="flex items-center justify-center w-full sm:w-auto gap-2 py-3 px-6 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-all duration-300 transform hover:scale-105"
                        >
                            <CalendarIcon className="w-5 h-5" />
                            Add to Calendar
                        </button>

                        {isCalendarOpen && (
                            <div className="origin-bottom-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <a href="#" onClick={handleAddToGoogle} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600" role="menuitem">
                                        <GoogleIcon className="w-5 h-5" />
                                        Google Calendar
                                    </a>
                                    <a href="#" onClick={handleDownloadIcs} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600" role="menuitem">
                                        <AppleIcon className="w-5 h-5"/>
                                        Outlook / Apple (.ics)
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onBack}
                        className="py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md font-medium transition-colors"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};