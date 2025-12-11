"use client";

import React from "react";

import Hero from "./page-components/Hero";
import CaseStudy from "./page-components/CaseStudy";
import Testimonial from "./page-components/Testimonial";
import ProductShowcase from "./page-components/ProductShowcase";

export default function ThemePage() {
  return (
    <>
      <Hero />
      <CaseStudy />
      <Testimonial />
      <ProductShowcase />
    </>
  );
}
