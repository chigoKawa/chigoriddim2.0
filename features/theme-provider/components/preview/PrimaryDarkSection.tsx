"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function PrimaryDarkSection() {
  return (
    <section
      style={{
        background: "color-mix(in oklab, var(--primary), black 55%)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
        padding: 20,
      }}
    >
      <h3 style={{ margin: 0 }}>Performance that scales with you</h3>
      <p style={{ margin: 0, opacity: 0.9, marginTop: 6 }}>
        Compose experiences faster with a reliable content platform.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button variant="secondary">See pricing</Button>
        <Button>Start building</Button>
      </div>
    </section>
  );
}
