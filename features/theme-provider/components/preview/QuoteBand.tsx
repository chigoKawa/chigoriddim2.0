"use client";
import React from "react";

export default function QuoteBand() {
  return (
    <section
      style={{
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
        padding: 20,
      }}
    >
      <blockquote style={{ margin: 0, fontSize: "var(--font-size-h4, 20px)", lineHeight: 1.35 }}>
        “Having an infrastructure where we can design really delightful, personalized micro-interactions with them at
        scale makes a huge difference for customers.”
      </blockquote>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <img
          src="https://picsum.photos/64/64?random=3"
          alt="Author"
          style={{ width: 40, height: 40, borderRadius: 9999, objectFit: "cover", border: "1px solid color-mix(in oklab, var(--primary-foreground), transparent 70%)" }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>Todd Bonker</div>
          <div style={{ opacity: 0.8 }}>English co-speaker</div>
        </div>
      </div>
    </section>
  );
}
