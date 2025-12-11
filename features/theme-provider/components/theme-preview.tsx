"use client";
import React, { useMemo } from "react";
import { useTheme } from "../theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HeroDefault from "./preview/HeroDefault";
import StatsRow from "./preview/StatsRow";
import FeaturedCaseStudy from "./preview/FeaturedCaseStudy";
import QuoteBand from "./preview/QuoteBand";
import PrimaryDarkSection from "./preview/PrimaryDarkSection";
import ProductCardGrid from "./preview/ProductCardGrid";

export default function ThemePreview() {
  const { theme } = useTheme();

  const sizes = useMemo(
    () => Object.entries(theme.typography?.sizeScale ?? {}),
    [theme]
  );

  const swatch = (label: string, cssVar: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: `var(${cssVar})`,
          border: "1px solid var(--color-border, #e6e8f0)",
        }}
      />
      <code style={{ fontSize: 12 }}>{label}</code>
    </div>
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        border: "1px solid #e6e8f0",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <section style={{ gridColumn: "1 / -1" }}>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Preview Sections</h4>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <HeroDefault />
          <StatsRow />
          <FeaturedCaseStudy />
          <QuoteBand />
          <PrimaryDarkSection />
          <ProductCardGrid />
        </div>
      </section>
      <section>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Primitives</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <div style={{ marginTop: 12 }}>
          <Alert>
            <AlertTitle>Theming active</AlertTitle>
            <AlertDescription>
              Buttons, borders, rings should reflect CSS vars.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Form</h4>
        <Card>
          <CardHeader>
            <CardTitle>Signup</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@company.com" />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Jane" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Colors</h4>
        <div style={{ display: "grid", gap: 8 }}>
          {swatch("--color-background", "--color-background")}
          {swatch("--color-foreground", "--color-foreground")}
          {swatch("--color-primary", "--color-primary")}
          {swatch("--color-primary-foreground", "--color-primary-foreground")}
          {swatch("--color-secondary", "--color-secondary")}
          {swatch("--color-ring", "--color-ring")}
          {swatch("--color-border", "--color-border")}
        </div>
      </section>

      <section>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Typography sizes</h4>
        <div style={{ display: "grid", gap: 6 }}>
          {sizes.length === 0 ? (
            <span style={{ color: "#6b7280" }}>No sizes defined</span>
          ) : (
            sizes.map(([k, v]) => (
              <div
                key={k}
                style={{ display: "flex", alignItems: "baseline", gap: 10 }}
              >
                <code style={{ width: 110 }}>--font-size-{k}</code>
                <span style={{ fontSize: v as string }}>The quick brown fox</span>
                <span style={{ marginLeft: "auto", color: "#6b7280" }}>
                  {String(v)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
