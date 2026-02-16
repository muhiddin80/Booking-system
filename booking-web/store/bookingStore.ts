import { create } from 'zustand';
import { Booking } from '@/lib/api';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  isBooking: boolean;
  bookingEventId: string | null;
  
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBooking: (isBooking: boolean, eventId: string | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  removeBooking: (bookingId: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,
  isBooking: false,
  bookingEventId: null,
  
  setBookings: (bookings) => {
    set({ bookings, isLoading: false, error: null });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  setBooking: (isBooking, eventId) => {
    set({ isBooking, bookingEventId: eventId });
  },
  
  addBooking: (booking) => {
    set((state) => ({
      bookings: [booking, ...state.bookings],
      isBooking: false,
      bookingEventId: null,
    }));
  },
  
  updateBooking: (bookingId, updates) => {
    set((state) => ({
      bookings: state.bookings.map(booking =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ),
    }));
  },
  
  removeBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.filter(booking => booking.id !== bookingId),
    }));
  },
  
  reset: () => {
    set({
      bookings: [],
      isLoading: false,
      error: null,
      isBooking: false,
      bookingEventId: null,
    });
  },
}));
