import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const getApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const code = error.code;
    
    return { message, status, code };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  return { message: 'An unexpected error occurred' };
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
};

export const isServerError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 500;
  }
  return false;
};

export const isClientError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
  return false;
};
