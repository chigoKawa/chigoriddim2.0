"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

const PreviewWarningsContext = createContext<{
  showWarnings: boolean;
  setShowWarnings: (value: boolean) => void;
} | null>(null);

export function PreviewWarningsProvider({ children }: { children: ReactNode }) {
  const [showWarnings, setShowWarnings] = useState(true);

  return (
    <PreviewWarningsContext.Provider value={{ showWarnings, setShowWarnings }}>
      {children}
    </PreviewWarningsContext.Provider>
  );
}

export function usePreviewWarnings() {
  const ctx = useContext(PreviewWarningsContext);
  if (!ctx) {
    return { showWarnings: true, setShowWarnings: () => {} };
  }
  return ctx;
}
