"use client";
import Image from "next/image";
import { useMemo } from "react";
import { useTheme } from "@/features/theme-provider/theme-provider";

// You can pass the entry down via context if needed. For simplicity, pass logos as props.
export function SiteLogo({
  dark = false,
  width = 140,
  height = 32,
  alt = "Logo",
  className,
  priority,
}: {
  dark?: boolean;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const { logos } = useTheme();
  const src = useMemo(
    () => (dark ? logos.dark || logos.light : logos.light || logos.dark),
    [dark, logos]
  );
  console.log("liveEntry site loto", logos);
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

export default SiteLogo;
