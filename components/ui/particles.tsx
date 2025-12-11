"use client";

import React from "react";

// Pre-computed particle positions for deterministic rendering
// Circles: size, left%, top%, delay, duration
const CIRCLES = [
  { size: 25, left: 5, top: 20, delay: 0, duration: 18 },
  { size: 15, left: 15, top: 60, delay: 2, duration: 22 },
  { size: 35, left: 25, top: 40, delay: 1, duration: 15 },
  { size: 20, left: 40, top: 80, delay: 3, duration: 20 },
  { size: 30, left: 55, top: 30, delay: 0.5, duration: 17 },
  { size: 18, left: 65, top: 70, delay: 2.5, duration: 23 },
  { size: 40, left: 75, top: 15, delay: 1.5, duration: 19 },
  { size: 22, left: 85, top: 55, delay: 4, duration: 21 },
  { size: 28, left: 92, top: 35, delay: 0.8, duration: 16 },
  { size: 16, left: 10, top: 85, delay: 3.5, duration: 24 },
  { size: 32, left: 48, top: 10, delay: 2.2, duration: 18 },
  { size: 24, left: 70, top: 90, delay: 1.8, duration: 20 },
];

// Squares: size, left%, top%, delay, duration
const SQUARES = [
  { size: 20, left: 8, top: 45, delay: 0, duration: 25 },
  { size: 35, left: 30, top: 75, delay: 3, duration: 28 },
  { size: 25, left: 50, top: 25, delay: 5, duration: 22 },
  { size: 30, left: 72, top: 60, delay: 2, duration: 30 },
  { size: 22, left: 88, top: 20, delay: 7, duration: 26 },
  { size: 28, left: 18, top: 10, delay: 4, duration: 24 },
];

// CSS-only floating shapes with pre-computed positions
export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Floating circles with music notes */}
      {CIRCLES.map((circle, i) => (
        <div
          key={`circle-${i}`}
          className="absolute rounded-full bg-white/20 animate-float flex items-center justify-center text-white/60"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.left}%`,
            top: `${circle.top}%`,
            animationDelay: `${circle.delay}s`,
            animationDuration: `${circle.duration}s`,
            fontSize: Math.max(circle.size * 0.5, 10),
          }}
        >
          🎶
        </div>
      ))}

      {/* Floating diamonds */}
      {SQUARES.map((square, i) => (
        <div
          key={`square-${i}`}
          className="absolute bg-white/15 rotate-45 animate-float-slow"
          style={{
            width: square.size,
            height: square.size,
            left: `${square.left}%`,
            top: `${square.top}%`,
            animationDelay: `${square.delay}s`,
            animationDuration: `${square.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// Pre-computed sparkle positions
const SPARKLES = [
  { left: 10, top: 20, delay: 0 },
  { left: 25, top: 70, delay: 0.5 },
  { left: 40, top: 40, delay: 1 },
  { left: 55, top: 85, delay: 1.5 },
  { left: 70, top: 30, delay: 2 },
  { left: 85, top: 60, delay: 2.5 },
  { left: 15, top: 50, delay: 3 },
  { left: 60, top: 15, delay: 3.5 },
  { left: 90, top: 45, delay: 4 },
  { left: 35, top: 90, delay: 4.5 },
];

// Sparkle effect - small twinkling dots
export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {SPARKLES.map((sparkle, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-white/80 rounded-full animate-twinkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
