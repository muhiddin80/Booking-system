import { format } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMMM d, yyyy \'at\' h:mm a');
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

export const getTicketStatusColor = (remaining: number, total: number): string => {
  if (remaining === 0) return 'bg-gray-500 text-white border border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700';
  if (remaining < total * 0.1) return 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700';
  if (remaining < total * 0.5) return 'bg-yellow-500 text-white border border-yellow-600 dark:bg-yellow-600 dark:text-white dark:border-yellow-700';
  return 'bg-green-500 text-white border border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700';
};

export const getTicketStatusText = (remaining: number): string => {
  if (remaining === 0) return 'Sold Out';
  if (remaining === 1) return '1 ticket left';
  if (remaining <= 5) return `${remaining} tickets left`;
  return `${remaining} tickets left`;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
