"use client";

import React, { createContext, useContext } from "react";

export const PreviewModeContext = createContext<boolean>(false);

export function usePreviewMode(): boolean {
  return useContext(PreviewModeContext);
}

export function PreviewModeProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  );
}
