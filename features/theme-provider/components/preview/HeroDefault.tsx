"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function HeroDefault() {
  return (
    <section
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ position: "relative", height: 220 }}>
        <img
          src="https://picsum.photos/1200/400?random=1"
          alt="Hero"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, color-mix(in oklab, var(--background), transparent 30%) 0%, transparent 60%)",
          }}
        />
      </div>
      <div style={{ padding: 16, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: "var(--font-size-h3, 28px)" }}>
          Driving content at scale for businesses of all sizes.
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button>Learn more</Button>
          <Button variant="outline">Contact sales</Button>
        </div>
      </div>
    </section>
  );
}
