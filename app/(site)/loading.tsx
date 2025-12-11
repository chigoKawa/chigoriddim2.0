import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading UI for the site route group
 * Displayed while page content is being fetched
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="w-full h-[60vh] bg-muted animate-pulse" />

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Section 1 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
