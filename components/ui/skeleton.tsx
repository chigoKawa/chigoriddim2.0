import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation style */
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * Skeleton loading placeholder component
 */
function Skeleton({ className, animation = "pulse", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        animation === "pulse" && "animate-pulse",
        animation === "shimmer" &&
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card skeleton for content loading states
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Text skeleton for paragraph loading states
 */
// Predefined widths for text skeleton lines (deterministic)
const LINE_WIDTHS = ["100%", "85%", "70%", "90%", "75%", "95%", "80%", "65%"];

function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
function AvatarSkeleton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

export { Skeleton, CardSkeleton, TextSkeleton, AvatarSkeleton };
