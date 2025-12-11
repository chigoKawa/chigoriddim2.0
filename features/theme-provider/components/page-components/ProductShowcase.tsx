"use client";

import React from "react";
import products from "../data/product-cards.json";

type Product = {
  name: string;
  price: string;
  description: string;
  imageSrc: string;
};

const productList = products as Product[];

export default function ProductShowcase() {
  return (
    <section
      style={{
        padding: "0 16px 64px 16px",
        //background: "var(--color-secondary, #f3f4f6)",
        fontFamily: "var(--font-family-body)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gap: 48,
        }}
      >
        <header style={{ textAlign: "center", display: "grid", gap: 12 }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: 4,
              fontSize: 12,
              // color: "var(--color-ring, #64748b)",
              fontWeight: 600,
            }}
          >
            Shop the Ride
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.2,
              color: "var(--color-foreground, #111827)",
              fontWeight: 700,
              fontFamily: "var(--font-family-header-h1"
            }}
          >
            Gear built for performance
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 560,
              color: "var(--color-foreground, #4b5563)",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            Every product is tuned to help your riders push harder, recover faster, and elevate their experience on and off the bike.
          </p>
        </header>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {productList.map((product) => (
            <article
              key={product.name}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "var(--radius, 8px)",
                overflow: "hidden",
                //border: "1px solid var(--color-border, #e5e7eb)",
                //background: "var(--color-background, #ffffff)",
                background: "linear-gradient(161deg, var(--color-primary-300) 0%, transparent 50%, transparent 100%)",
                boxShadow: "rgba(15, 23, 42, 0.32) 7px 7px 13px -11px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "66%",
                  // background: "var(--color-background, #f8fafc)",
                }}
              >
                <img
                  src={product.imageSrc}
                  alt={product.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  padding: 28,
                  display: "grid",
                  gap: 12,
                  // background: "var(--color-background, #ffffff)",
                  color: "var(--color-foreground, #111827)",
                  flexGrow: 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.2, fontWeight: 600 }}>
                    {product.name}
                  </h3>
                  <span style={{ marginLeft: "auto", fontWeight: 200, fontFamily: "var(--font-family-subheader)" }}>
                    {product.price}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4, fontFamily: "var(--font-family-subheader)" }}>
                  {product.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
