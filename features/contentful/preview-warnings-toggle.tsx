"use client";

import React from "react";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";

export default function PreviewWarningsToggle() {
  const { showWarnings, setShowWarnings } = usePreviewWarnings();

  return (
    <button
      type="button"
      onClick={() => setShowWarnings(!showWarnings)}
      className="ml-3 inline-flex items-center gap-1 rounded-full border border-amber-700/50 bg-amber-600/20 px-2 py-0.5 text-[11px] font-medium hover:bg-amber-600/30"
    >
      <span
        className={[
          "inline-flex h-3 w-6 items-center rounded-full bg-amber-900/40 transition-colors",
        ].join(" ")}
      >
        <span
          className={[
            "h-2 w-2 rounded-full bg-amber-50 shadow-sm transition-transform",
            showWarnings ? "translate-x-3" : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
      <span>{showWarnings ? "Hide guidance" : "Show guidance"}</span>
    </button>
  );
}
