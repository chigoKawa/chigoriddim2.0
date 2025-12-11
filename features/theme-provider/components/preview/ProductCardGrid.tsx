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

export default function ProductCardGrid() {
  return (
    <section
      style={{
        background: "var(--color-background, #ffffff)",
        border: "1px solid var(--color-border, #e5e7eb)",
        borderRadius: "calc(var(--radius, 8px) + 4px)",
        padding: 16,
        display: "grid",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Featured Products</h3>
        <p style={{ margin: 0, color: "var(--muted-foreground, #4b5563)", fontSize: 14 }}>
          Curated gear to keep every ride dialed in.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
              border: "1px solid var(--color-border, #e5e7eb)",
              background: "var(--color-background, #ffffff)",
              boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "66%",
                background: "var(--color-secondary, #f4f4f5)",
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
                background: "var(--color-secondary, #f3f4f6)",
                color: "var(--color-foreground, #111827)",
                padding: 16,
                display: "grid",
                gap: 8,
                flexGrow: 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h4 style={{ margin: 0, fontSize: 16 }}>{product.name}</h4>
                <span style={{ fontWeight: 600 }}>{product.price}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                {product.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
