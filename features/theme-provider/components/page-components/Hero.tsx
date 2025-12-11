"use client";

import React, { useState } from "react";

export default function Hero() {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 16px",
        backgroundColor: "var(--color-background, #f9f9f9)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-family-header-h1)",
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        Ciao Coin! <br /> See you in Rome.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-family-body)",
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--color-foreground)",
          maxWidth: 640,
          margin: "0 auto 32px",
        }}
      >
        Join us in the Eternal City to exchange ideas, share experiences, and enjoy an unforgettable event.
      </p>
      <button
        style={{
          background: hovered
            ? "var(--color-primary-500)"
            : "var(--color-primary)",
          transition: "background 0.2s",
          color: "var(--color-primary-foreground)",
          fontFamily: "var(--font-family-subheader)",
          border: "none",
          padding: "12px 24px",
          borderRadius: 4,
          fontWeight: 600,
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Get Tickets
      </button>
    </section>
  );
}
