import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  totalTickets: number;
  remainingTickets: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  event: Event;
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingRequest {
  eventId: string;
}

export interface BookingResponse {
  booking: Booking;
  event: Event;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await authApi.refresh(refreshToken);
          setTokens(response.accessToken, response.refreshToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const authApi = {
  register: async (
    data: RegisterData
  ): Promise<AxiosResponse<LoginResponse>> => {
    return apiClient.post("/auth/register", data);
  },

  login: async (data: LoginData): Promise<AxiosResponse<LoginResponse>> => {
    return apiClient.post("/auth/login", data);
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },
};

export const eventsApi = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "date" | "price" | "title";
    sortOrder?: "asc" | "desc";
  }): Promise<AxiosResponse<EventsResponse>> => {
    return apiClient.get("/events", { params });
  },

  getEvent: async (id: string): Promise<AxiosResponse<Event>> => {
    return apiClient.get(`/events/${id}`);
  },
};

export const bookingsApi = {
  createBooking: async (
    data: BookingRequest
  ): Promise<AxiosResponse<BookingResponse>> => {
    return apiClient.post("/bookings", data);
  },

  getBookings: async (): Promise<AxiosResponse<Booking[]>> => {
    return apiClient.get("/bookings");
  },

  cancelBooking: async (id: string): Promise<AxiosResponse<void>> => {
    return apiClient.delete(`/bookings/${id}`);
  },
};

export default apiClient;
