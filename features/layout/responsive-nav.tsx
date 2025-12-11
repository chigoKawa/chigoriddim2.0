"use client";
import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SiteLogo from "@/features/site-logo/site-logo";
import { SearchTrigger } from "@/features/search";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  openInNewTab?: boolean;
  children?: NavItem[];
};

// Custom hook using useSyncExternalStore to avoid setState in effect
function useIsMobile() {
  const subscribe = (callback: () => void) => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const ResponsiveNavbar = ({ items }: { items: NavItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openDesktopIndex, setOpenDesktopIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <nav
      className="w-full relative z-50 border-b border-[color:var(--color-primary)]/15"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
        padding: "12px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Link href="/">
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            <SiteLogo />
          </div>
        </Link>

        {isMobile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <SearchTrigger />
              <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: "pointer" }}
              >
                <div style={barStyle} />
                <div style={barStyle} />
                <div style={barStyle} />
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-full left-0 right-0 overflow-hidden shadow-lg border-t border-[color:var(--color-border)]/10"
                  style={{
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {items.map((item, idx) => {
                    const hasChildren =
                      item.children && item.children.length > 0;
                    const sectionOpen = openIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="border-b border-[color:var(--color-border)]/10"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenIndex(sectionOpen ? null : idx)}
                          className="w-full text-left px-6 py-3 flex justify-between items-center bg-transparent border-none cursor-pointer transition-colors hover:bg-[color:var(--color-primary)]/10"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          <span>{item.label}</span>
                          {hasChildren ? (
                            <span>{sectionOpen ? "−" : "+"}</span>
                          ) : null}
                        </button>
                        <AnimatePresence initial={false}>
                          {sectionOpen && hasChildren && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: "hidden" }}
                            >
                              {item.children!.map((child, cIdx) => (
                                <div key={cIdx} className="px-8 py-2">
                                  <Link
                                    href={child.href}
                                    target={
                                      child.openInNewTab ? "_blank" : undefined
                                    }
                                    rel={
                                      child.openInNewTab
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className="inline-block py-1 px-2 rounded transition-colors hover:bg-[color:var(--color-primary)]/10"
                                  >
                                    {child.label}
                                  </Link>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex gap-6 items-center">
            <SearchTrigger />
            {items.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = openDesktopIndex === idx;

              return (
                <div
                  key={idx}
                  className="relative inline-block"
                  onMouseEnter={() => hasChildren && setOpenDesktopIndex(idx)}
                  onMouseLeave={() =>
                    hasChildren &&
                    setOpenDesktopIndex((current) =>
                      current === idx ? null : current
                    )
                  }
                >
                  <Link
                    href={item.href}
                    className="cursor-pointer px-3 py-2 rounded-md inline-block transition-colors hover:bg-[color:var(--color-primary)]/10 font-medium text-sm"
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 min-w-[180px] rounded-lg overflow-hidden z-50 shadow-xl border border-[color:var(--color-border)]/10"
                          style={{
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-foreground)",
                          }}
                        >
                          {item.children!.map((child, cIdx) => (
                            <Link
                              key={cIdx}
                              href={child.href}
                              target={child.openInNewTab ? "_blank" : undefined}
                              rel={
                                child.openInNewTab
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="block px-4 py-2.5 text-sm transition-colors hover:bg-[color:var(--color-primary)]/10"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

// Hamburger bar style using CSS variable for theme-aware color
const barStyle: React.CSSProperties = {
  width: 24,
  height: 2,
  backgroundColor: "var(--color-foreground)",
  margin: "4px 0",
  borderRadius: 1,
};
export default ResponsiveNavbar;
