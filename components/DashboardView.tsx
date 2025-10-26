

import React, { useState, useEffect, useMemo } from 'react';
import { EventDetails, TimeLeft } from '../types.ts';
import { getTargetDate, calculateTimeLeft } from '../utils/calendar.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { GiftIcon } from './icons/GiftIcon.tsx';
import { CakeIcon } from './icons/CakeIcon.tsx';
import { BriefcaseIcon } from './icons/BriefcaseIcon.tsx';
import { PlaneIcon } from './icons/PlaneIcon.tsx';
import { TagIcon } from './icons/TagIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { Confetti } from './Confetti.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import { CategoryManager } from './CategoryManager.tsx';

interface DashboardViewProps {
  events: EventDetails[];
  categories: string[];
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onAddNew: () => void;
  onEditEvent: (id: string) => void;
  onUpdateEvent: (id: string, updates: Partial<EventDetails>) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

const MiniTimeCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span key={value} className="text-2xl font-mono text-cyan-300 animate-pop-in">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
  </div>
);

const categoryIconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Holiday: GiftIcon,
  Birthday: CakeIcon,
  Work: BriefcaseIcon,
  Travel: PlaneIcon,
  Anniversary: GiftIcon,
  Personal: TagIcon,
  Other: TagIcon,
};


const EventCard: React.FC<{
  event: EventDetails;
  timeLeft: TimeLeft;
  isFinished: boolean;
  progress: number;
  categories: string[];
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onUpdateCategory: (newCategory: string) => void;
}> = ({ event, timeLeft, isFinished, progress, categories, onSelect, onEdit, onDelete, onUpdateCategory }) => {
  const CategoryIcon = categoryIconMap[event.category || 'Other'] || TagIcon;
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onUpdateCategory(e.target.value);
    setIsEditingCategory(false);
  };
  
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingCategory(true);
  };

  return (
    <div 
        className="relative bg-gray-800 rounded-xl overflow-hidden group transition-all duration-500 hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-fade-in"
        onClick={onSelect}
    >
      {isFinished && <Confetti count={80} />}
      {event.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110 filter blur-sm group-hover:blur-none"
          style={{ backgroundImage: `url(${event.backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full min-h-[220px]">
        {/* Top Section */}
        <div>
          <div className="flex justify-between items-start">
              <h3 className="font-bold text-xl text-white mb-1 truncate" title={event.title}>
                  {event.title}
              </h3>
              <div className="flex items-center -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={onEdit} 
                  className="relative z-20 text-gray-500 hover:text-cyan-400 transition-colors p-1.5 rounded-full bg-black/20 hover:bg-black/50"
                  title="Edit Event"
                  >
                    <EditIcon className="w-5 h-5"/>
                </button>
                <button 
                  onClick={onDelete} 
                  className="relative z-20 text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-full bg-black/20 hover:bg-black/50"
                  title="Delete Event"
                  >
                    <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
          </div>
          <p className="text-sm text-gray-400">
              {getTargetDate(event).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}
          </p>
        </div>

        {/* Middle Section: Countdown */}
        <div className="flex-grow flex items-center justify-center -my-4">
             {isFinished ? (
              <div className="text-center w-full text-green-400 font-bold text-2xl py-3 animate-pop-in">Finished</div>
            ) : (
              <div className="flex justify-around w-full items-center transition-all duration-300">
                  <MiniTimeCard value={timeLeft.days} label="Days" />
                  <MiniTimeCard value={timeLeft.hours} label="Hrs" />
                  <MiniTimeCard value={timeLeft.minutes} label="Min" />
                  <MiniTimeCard value={timeLeft.seconds} label="Sec" />
              </div>
            )}
        </div>
        
        {/* Bottom Section: Progress & Category */}
        <div>
            <div className="flex justify-between items-center mb-2">
                {event.category ? (
                    isEditingCategory ? (
                        <select
                            value={event.category}
                            onChange={handleCategoryChange}
                            onBlur={() => setIsEditingCategory(false)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-gray-700 text-gray-200 py-1 pl-1 pr-4 rounded-md border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            autoFocus
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    ) : (
                        <div 
                            className="flex items-center gap-1.5 text-xs bg-black/50 text-gray-300 px-2 py-1 rounded-full cursor-pointer hover:bg-black/70"
                            onClick={handleCategoryClick}
                            title="Click to change category"
                        >
                            <CategoryIcon className="w-3 h-3" />
                            <span>{event.category}</span>
                        </div>
                    )
                ) : <div />}
                 <span className="text-xs text-gray-400 font-mono">{Math.floor(progress)}% complete</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-teal-400 h-2 rounded-full transition-all duration-1000 ease-linear shadow-lg shadow-cyan-500/30"
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ events, categories, onSelectEvent, onDeleteEvent, onAddNew, onEditEvent, onUpdateEvent, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const displayCategories = useMemo(() => ["All", ...categories], [categories]);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const countdowns = useMemo(() => {
        return events
            .filter(event => {
                if (activeFilter === 'All') return true;
                return event.category === activeFilter;
            })
            .map(event => {
                const targetDate = getTargetDate(event);
                const { timeLeft, isFinished } = calculateTimeLeft(targetDate);
                
                const creationTime = parseInt(event.id, 10);
                const targetTime = targetDate.getTime();
                const now = currentTime.getTime();

                let progress = 0;
                if (!isNaN(creationTime)) {
                    if (isFinished) {
                        progress = 100;
                    } else {
                        const totalDuration = targetTime - creationTime;
                        const elapsedDuration = now - creationTime;
                        if (totalDuration > 0) {
                            progress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
                        }
                    }
                }

                return { ...event, timeLeft, isFinished, progress };
            });
    }, [events, currentTime, activeFilter]);

    const gridContainerClass = useMemo(() => {
        const count = countdowns.length;
        const baseClass = 'grid gap-8';

        if (count === 1) {
            return `${baseClass} grid-cols-1 max-w-3xl mx-auto`;
        }
        if (count === 2) {
            return `${baseClass} grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto`;
        }
        if (count === 4) {
            return `${baseClass} grid-cols-1 md:grid-cols-2`;
        }
        // Default for 3, and 5+ events
        return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }, [countdowns.length]);

  return (
    <>
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white">Your Countdowns</h1>
            <button
                onClick={onAddNew}
                className="flex items-center gap-2 py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-all transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5" />
                <span>New</span>
            </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
            {displayCategories.map(category => (
                <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ease-in-out ${
                        activeFilter === category 
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {category}
                </button>
            ))}
             <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="p-2 ml-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
                title="Manage Categories"
            >
                <CogIcon className="w-5 h-5" />
            </button>
        </div>

        {events.length > 0 ? (
            countdowns.length > 0 ? (
                <div className={gridContainerClass}>
                    {countdowns.map(event => (
                        <EventCard 
                            key={event.id}
                            event={event}
                            timeLeft={event.timeLeft}
                            isFinished={event.isFinished}
                            progress={event.progress}
                            categories={categories}
                            onSelect={() => onSelectEvent(event.id)}
                            onEdit={(e) => {
                                e.stopPropagation();
                                onEditEvent(event.id);
                            }}
                            onDelete={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(event.id);
                            }}
                            onUpdateCategory={(newCategory: string) => {
                                onUpdateEvent(event.id, { category: newCategory });
                            }}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-white">No countdowns for "{activeFilter}"</h2>
                    <p className="text-gray-400 mt-2 mb-6">Try selecting a different category or create a new countdown.</p>
                     <button
                        onClick={onAddNew}
                        className="inline-flex items-center gap-2 py-2 px-5 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Countdown
                    </button>
                </div>
            )
        ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-white">No countdowns yet!</h2>
                <p className="text-gray-400 mt-2 mb-6">Click the "New" button to create your first countdown.</p>
                <button
                    onClick={onAddNew}
                    className="inline-flex items-center gap-2 py-2 px-5 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create Countdown
                </button>
            </div>
        )}
    </div>
    {isCategoryManagerOpen && (
        <CategoryManager
            categories={categories}
            onClose={() => setIsCategoryManagerOpen(false)}
            onAdd={onAddCategory}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
        />
    )}
    </>
  );
};