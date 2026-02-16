"use client";

import { useState, useCallback } from "react";
import { Event } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  getTicketStatusColor,
  getTicketStatusText,
} from "@/lib/utils";
import { getApiError } from "@/lib/error-handler";
import { Calendar, MapPin, DollarSign, Loader2, Check } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { useEventStore } from "@/store/eventStore";
import toast from "react-hot-toast";

interface EventCardProps {
  event: Event;
  onBook: (eventId: string) => Promise<void>;
}

type BookingStatus = "idle" | "loading" | "success" | "error";

export default function EventCard({ event, onBook }: EventCardProps) {
  const { isBooking, bookingEventId } = useBookingStore();
  const { updateEvent } = useEventStore();
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");

  const handleBookClick = useCallback(async () => {
    if (event.remainingTickets === 0) {
      toast.error("This event is sold out");
      return;
    }

    if (bookingStatus === "success") {
      toast("You have already booked this event", {
        icon: "ℹ️",
        style: {
          background: "#3b82f6",
          color: "#fff",
        },
      });
      return;
    }

    setBookingStatus("loading");

    try {
      await onBook(event.id);
      setBookingStatus("success");

      updateEvent(event.id, {
        remainingTickets: Math.max(0, event.remainingTickets - 1),
      });

      toast.success(`Successfully booked "${event.title}"!`);
    } catch (error: unknown) {
      setBookingStatus("error");
      const apiError = getApiError(error);
      
      if (apiError.status === 409) {
        const message = apiError.message.toLowerCase();
        
        if (message.includes("already booked")) {
          setBookingStatus("success");
          toast("You have already booked this event", {
            icon: "ℹ️",
            style: {
              background: "#3b82f6",
              color: "#fff",
            },
          });
        } else if (message.includes("no tickets")) {
          updateEvent(event.id, { remainingTickets: 0 });
          toast.error(
            `Sorry, tickets for "${event.title}" are no longer available`
          );
        }
      } else {
        toast.error("Failed to complete booking. Please try again");
      }
    }
  }, [event, onBook, bookingStatus, updateEvent]);

  const isLoading = isBooking && bookingEventId === event.id;
  const ticketStatusColor = getTicketStatusColor(
    event.remainingTickets,
    event.totalTickets
  );
  const ticketStatusText = getTicketStatusText(event.remainingTickets);
  const isSoldOut = event.remainingTickets === 0;
  const isBooked = bookingStatus === "success";

  const getButtonVariant = () => {
    if (isBooked) {
      return "bg-green-600 text-white cursor-not-allowed hover:bg-green-700 shadow-green-200 border border-green-700 dark:bg-green-700 dark:text-white dark:hover:bg-green-800 dark:border-green-800";
    }
    if (isSoldOut) {
      return "bg-gray-500 text-white cursor-not-allowed hover:bg-gray-600 shadow-gray-200 border border-gray-600 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:border-gray-700";
    }
    return "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 active:scale-105 shadow-indigo-200 border border-indigo-600 dark:from-indigo-700 dark:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 dark:border-indigo-700";
  };

  const getButtonText = () => {
    if (isLoading) return "Booking...";
    if (isBooked) return "Booked ✓";
    if (isSoldOut) return "Sold Out";
    return "Book Now";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 relative group dark:bg-gray-800 dark:border-gray-700">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl dark:bg-gray-900/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Booking...
            </span>
          </div>
        </div>
      )}

      <div
        className={`flex flex-col h-full p-8 ${isLoading ? "opacity-50" : ""}`}
      >
        <div className="flex justify-between items-start gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 leading-snug line-clamp-2 dark:text-white">
            {event.title}
          </h3>

          <span
            className={`px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${ticketStatusColor}`}
          >
            {ticketStatusText}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-8 line-clamp-3 dark:text-gray-400">
          {event.description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-6 dark:border-gray-700"></div>

        {/* Event Details */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-medium">{event.venue}</span>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-bold text-xl text-indigo-600">
              {formatCurrency(event.price)}
            </span>
          </div>
        </div>

        <button
          onClick={handleBookClick}
          disabled={isLoading || isSoldOut || isBooked}
          className={`w-full py-3.5 mt-auto rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center relative overflow-hidden group ${getButtonVariant()}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Booking...
            </>
          ) : isBooked ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Booked ✓
            </>
          ) : (
            getButtonText()
          )}
        </button>
      </div>
    </div>
  );
}
