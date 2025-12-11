"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function FeaturedCaseStudy() {
  return (
    <section
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        padding: 16,
      }}
    >
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Kraft Heinz secures the secret sauce with Contentful</h3>
          <p style={{ margin: 0, color: "var(--muted-foreground)" }}>
            Build faster with composable content. Scale design and messaging without slowing down your team.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button>Read the story</Button>
            <span style={{ height: 1, background: "var(--border)", flex: 1 }} />
          </div>
        </div>
        <div
          style={{
            borderRadius: "calc(var(--radius) + 4px)",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          <img
            src="https://picsum.photos/640/360?random=2"
            alt="Case study"
            style={{ width: "100%", height: 260, objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}
