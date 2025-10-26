
import React, { useState, useEffect, useCallback } from 'react';
import { EventDetails } from './types';
import { SetupView } from './components/SetupView';
import { CountdownView } from './components/CountdownView';
import { DashboardView } from './components/DashboardView';
import { getTargetDate } from './utils/calendar';

const STORAGE_KEY = 'countdownEventsList';

type View = 'dashboard' | 'setup' | 'countdown';

const App: React.FC = () => {
  const [events, setEvents] = useState<EventDetails[]>([]);
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
  }, []);

  const saveEvents = useCallback((updatedEvents: EventDetails[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      } catch (error) {
        console.error("Failed to save events to localStorage", error);
      }
  }, []);

  const handleSave = (details: Omit<EventDetails, 'id'>) => {
    let updatedEvents;
    if (editingEventId) {
        updatedEvents = events.map(event => 
            event.id === editingEventId ? { ...event, ...details } : event
        );
    } else {
        const newEvent: EventDetails = {
          ...details,
          id: new Date().getTime().toString(),
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
            onSelectEvent={handleSelectEvent}
            onDeleteEvent={handleDelete}
            onAddNew={handleAddNew}
            onEditEvent={handleEditEvent}
            onUpdateEvent={handleUpdateEvent}
        />
      )}
      {view === 'setup' && (
        <SetupView 
          onSave={handleSave} 
          onCancel={handleCancelSetup} 
          eventToEdit={eventToEdit}
        />
      )}
    </main>
  );
};

export default App;
