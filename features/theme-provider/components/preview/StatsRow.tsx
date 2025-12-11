"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function StatsRow() {
  const item = (label: string, value: string, accentVar = "--primary") => (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: `var(${accentVar})` }}>{value}</div>
      <div style={{ color: "var(--muted-foreground)" }}>{label}</div>
    </div>
  );

  return (
    <section
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {item("monthly API calls", "47k")}
        {item("assets", "110B")}
        {item("locales", "110")}
        {item("visitors", "550k")}
      </div>
      <div>
        <Button>Get started</Button>
      </div>
    </section>
  );
}
