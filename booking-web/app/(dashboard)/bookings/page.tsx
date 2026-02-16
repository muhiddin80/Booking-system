"use client";

import { useEffect, useState } from "react";
import { bookingsApi, Booking } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { useEventStore } from "@/store/eventStore";
import Navbar from "@/components/Navbar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getApiError } from "@/lib/error-handler";
import { Calendar, MapPin, DollarSign, Trash2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

type BookingStatus = "CONFIRMED" | "CANCELLED";

export default function BookingsPage() {
  const {
    bookings,
    isLoading,
    error,
    setBookings,
    setLoading,
    setError,
    removeBooking,
  } = useBookingStore();
  const { updateEvent } = useEventStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(
    null
  );

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsApi.getBookings();
      setBookings(response.data);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      setError(apiError.message || "Failed to fetch bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setCancellingId(bookingId);
    try {
      await bookingsApi.cancelBooking(bookingId);

      // Update local state
      removeBooking(bookingId);

      // Update event's remaining tickets
      updateEvent(booking.eventId, {
        remainingTickets: booking.event.remainingTickets + 1,
      });

      toast.success("Booking cancelled successfully");
      setShowConfirmDialog(null);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your event bookings</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven&apos;t booked any events yet
                </p>
                <a
                  href="/events"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Events
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {booking.event.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(booking.event.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            {booking.event.venue}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatCurrency(booking.event.price)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">Booked on:</span>
                            <span className="ml-2">
                              {formatDate(booking.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        {booking.status === "CONFIRMED" && (
                          <button
                            onClick={() => setShowConfirmDialog(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Booking
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cancel Booking
                  </h3>
                  <button
                    onClick={() => setShowConfirmDialog(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel this booking? This action
                    cannot be undone.
                  </p>
                </div>

                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => handleCancelBooking(showConfirmDialog)}
                    disabled={cancellingId === showConfirmDialog}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === showConfirmDialog ? (
                      <>
                        <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel Booking"
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(null)}
                    className="mt-3 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    No, Keep Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
