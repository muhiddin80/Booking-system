"use client";

import { useEffect, useState, useCallback } from "react";
import { eventsApi, bookingsApi } from "@/lib/api";
import { useEventStore } from "@/store/eventStore";
import { useBookingStore } from "@/store/bookingStore";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import { Search, SortAsc, SortDesc, Loader2 } from "lucide-react";
import { debounce } from "@/lib/utils";
import { getApiError } from "@/lib/error-handler";
import toast from "react-hot-toast";

type SortField = "date" | "price" | "title";
type SortOrder = "asc" | "desc";

export default function EventsPage() {
  const {
    events,
    isLoading,
    error,
    filters,
    meta,
    setEvents,
    setLoading,
    setError,
    setFilters,
  } = useEventStore();

  const { setBooking } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getEvents(filters);
      setEvents(response.data.data, response.data.meta);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      setError(apiError.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [filters, setEvents, setLoading, setError]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilters({ search: term });
    }, 300),
    [setFilters]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSortChange = (sortBy: SortField) => {
    const currentSort = filters.sortBy as SortField;
    const currentOrder = filters.sortOrder as SortOrder;

    const newSortOrder: SortOrder =
      currentSort === sortBy && currentOrder === "asc" ? "desc" : "asc";

    setFilters({ sortBy, sortOrder: newSortOrder });
  };

  const handleBookEvent = async (eventId: string) => {
    setBooking(true, eventId);
    try {
      await bookingsApi.createBooking({ eventId });
    } catch (error) {
      throw error;
    } finally {
      setBooking(false, null);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4 dark:text-red-400">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-700 mb-6 dark:text-gray-300">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-white">
              Discover Events
            </h1>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSortChange("date")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.sortBy === "date"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  Date
                  {filters.sortBy === "date" &&
                    (filters.sortOrder === "asc" ? (
                      <SortAsc className="ml-2 w-4 h-4" />
                    ) : (
                      <SortDesc className="ml-2 w-4 h-4" />
                    ))}
                </button>

                <button
                  onClick={() => handleSortChange("price")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.sortBy === "price"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  Price
                  {filters.sortBy === "price" &&
                    (filters.sortOrder === "asc" ? (
                      <SortAsc className="ml-2 w-4 h-4" />
                    ) : (
                      <SortDesc className="ml-2 w-4 h-4" />
                    ))}
                </button>

                <button
                  onClick={() => handleSortChange("title")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.sortBy === "title"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  Title
                  {filters.sortBy === "title" &&
                    (filters.sortOrder === "asc" ? (
                      <SortAsc className="ml-2 w-4 h-4" />
                    ) : (
                      <SortDesc className="ml-2 w-4 h-4" />
                    ))}
                </button>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="py-8">
              <div className="text-center mb-6">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">
                  Loading amazing events...
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {events.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-white">
                      No events found
                    </h3>
                    <p className="text-gray-600 text-lg dark:text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onBook={handleBookEvent}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-gray-700"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 px-3">
                Page {filters.page} of {meta.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === meta.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
