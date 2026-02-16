import { create } from 'zustand';
import { Event, EventsResponse } from '@/lib/api';

interface EventFilters {
  search: string;
  sortBy: 'date' | 'price' | 'title';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  meta: EventsResponse['meta'] | null;
  
  setEvents: (events: Event[], meta: EventsResponse['meta']) => void;
  setCurrentEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  resetFilters: () => void;
}

const defaultFilters: EventFilters = {
  search: '',
  sortBy: 'date',
  sortOrder: 'asc',
  page: 1,
  limit: 10,
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  meta: null,
  
  setEvents: (events, meta) => {
    set({ events, meta, isLoading: false, error: null });
  },
  
  setCurrentEvent: (event) => {
    set({ currentEvent: event, isLoading: false, error: null });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const shouldResetPage = newFilters.search !== undefined || 
                          newFilters.sortBy !== undefined || 
                          newFilters.sortOrder !== undefined;
    
    set({ 
      filters: { 
        ...currentFilters, 
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 
              (shouldResetPage ? 1 : currentFilters.page)
      }
    });
  },
  
  updateEvent: (eventId, updates) => {
    const { events } = get();
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    );
    set({ events: updatedEvents });
    
    const { currentEvent } = get();
    if (currentEvent?.id === eventId) {
      set({ currentEvent: { ...currentEvent, ...updates } });
    }
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
}));
