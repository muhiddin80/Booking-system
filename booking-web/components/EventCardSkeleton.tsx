export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse dark:bg-gray-700"></div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse dark:bg-gray-700"></div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse dark:bg-gray-700"></div>
        </div>
        
        {/* Details skeleton */}
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-gray-700"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
