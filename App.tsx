import React, { useState, useEffect, useCallback } from 'react';
import { EventDetails } from './types';
import { SetupView } from './components/SetupView';
import { CountdownView } from './components/CountdownView';
import { DashboardView } from './components/DashboardView';
import { getTargetDate } from './utils/calendar';
import { DEFAULT_CATEGORIES } from './constants/categories';

const STORAGE_KEY = 'countdownEventsList';
const CATEGORIES_STORAGE_KEY = 'countdownCategories';

type View = 'dashboard' | 'setup' | 'countdown';

const App: React.FC = () => {
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(STORAGE_KEY);
      if (savedEvents) {
        const parsedEvents: EventDetails[] = JSON.parse(savedEvents);
        // Filter out any events that are long past
        const now = Date.now();
        const futureEvents = parsedEvents.filter(event => 
            getTargetDate(event).getTime() > now - (24 * 60 * 60 * 1000) // Keep for 1 day after expiry
        );
        setEvents(futureEvents);
      }
    } catch (error) {
      console.error("Failed to load events from localStorage", error);
      localStorage.removeItem(STORAGE_KEY);
    }
    
    try {
      const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (savedCategories && JSON.parse(savedCategories).length > 0) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error("Failed to load categories from localStorage", error);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  const saveEvents = useCallback((updatedEvents: EventDetails[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      } catch (error) {
        console.error("Failed to save events to localStorage", error);
      }
  }, []);
  
  const saveCategories = useCallback((updatedCategories: string[]) => {
    try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
        setCategories(updatedCategories);
    } catch (error) {
        console.error("Failed to save categories to localStorage", error);
    }
  }, []);

  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
        saveCategories([...categories, newCategory].sort());
    }
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
      if (newCategory && oldCategory !== newCategory && !categories.includes(newCategory)) {
          const updatedCategories = categories.map(c => c === oldCategory ? newCategory : c);
          saveCategories(updatedCategories.sort());

          const updatedEvents = events.map(event =>
              event.category === oldCategory ? { ...event, category: newCategory } : event
          );
          saveEvents(updatedEvents);
      }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categories.length <= 1) {
        alert("You cannot delete the last category.");
        return;
    }
    if (window.confirm(`Are you sure you want to delete the "${categoryToDelete}" category? Events using it will be moved to another category.`)) {
        const updatedCategories = categories.filter(c => c !== categoryToDelete);
        
        const fallbackCategory = updatedCategories.includes('Other') ? 'Other' : updatedCategories[0];

        saveCategories(updatedCategories);

        const updatedEvents = events.map(event =>
            event.category === categoryToDelete ? { ...event, category: fallbackCategory } : event
        );
        saveEvents(updatedEvents);
    }
  };

  const handleSave = async (details: Omit<EventDetails, 'id'>) => {
    let updatedEvents;
    if (editingEventId) {
        updatedEvents = events.map(event => 
            event.id === editingEventId ? { ...event, ...details } : event
        );
    } else {
        const { getCategoryForTitle } = await import('./utils/ai');
        const category = await getCategoryForTitle(details.title, categories);
        const newEvent: EventDetails = {
          ...details,
          id: new Date().getTime().toString(),
          category: details.category || category,
        };
        updatedEvents = [...events, newEvent];
    }
    
    saveEvents(updatedEvents.sort((a,b) => getTargetDate(a).getTime() - getTargetDate(b).getTime()));
    setEditingEventId(null);
    setView('dashboard');
  };
  
  const handleDelete = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
  }

  const handleUpdateEvent = (id: string, updates: Partial<EventDetails>) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, ...updates } : event
    );
    saveEvents(updatedEvents);
  };
  
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setView('countdown');
  }

  const handleAddNew = () => {
    setEditingEventId(null);
    setView('setup');
  };

  const handleEditEvent = (id: string) => {
    setEditingEventId(id);
    setView('setup');
  };

  const handleCancelSetup = () => {
    setEditingEventId(null);
    setView('dashboard');
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventToEdit = editingEventId ? events.find(e => e.id === editingEventId) : undefined;


  if (view === 'countdown' && selectedEvent) {
    return <CountdownView eventDetails={selectedEvent} onBack={() => setView('dashboard')} />;
  }

  return (
    <main className={`min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-900 to-slate-800 ${view === 'dashboard' ? 'items-start' : 'items-center p-4'}`}>
      {view === 'dashboard' && (
        <DashboardView 
            events={events}
            categories={categories}
            onSelectEvent={handleSelectEvent}
            onDeleteEvent={handleDelete}
            onAddNew={handleAddNew}
            onEditEvent={handleEditEvent}
            onUpdateEvent={handleUpdateEvent}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
        />
      )}
      {view === 'setup' && (
        <SetupView 
          onSave={handleSave} 
          onCancel={handleCancelSetup} 
          eventToEdit={eventToEdit}
          categories={categories}
        />
      )}
    </main>
  );
};

export default App;