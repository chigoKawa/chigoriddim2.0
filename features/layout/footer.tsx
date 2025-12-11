"use client";
import LocaleSwitcher from "../locale-switching/locale-switcher";
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { FooterSection } from "@/features/navigation/getFooterNavigation";
import type { SocialLink } from "@/features/navigation/getSocialLinks";
import {
  Globe2,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";

// Dynamic import with ssr: false to avoid hydration issues
const FloatingShapes = dynamic(
  () => import("@/components/ui/particles").then((mod) => mod.FloatingShapes),
  { ssr: false }
);
const Sparkles = dynamic(
  () => import("@/components/ui/particles").then((mod) => mod.Sparkles),
  { ssr: false }
);
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getSocialIcon(label: string) {
  const key = label.toLowerCase();

  if (key.includes("linkedin")) return Linkedin;
  if (key.includes("github")) return Github;
  if (key.includes("twitter") || key === "x") return Twitter;
  if (key.includes("instagram")) return Instagram;
  if (key.includes("facebook")) return Facebook;
  if (key.includes("youtube")) return Youtube;

  return Globe2;
}

const Footer = ({
  sections,
  socialLinks,
  siteName,
}: {
  sections: FooterSection[];
  socialLinks?: SocialLink[];
  siteName?: string;
}) => {
  const thisyear = new Date().getFullYear();
  // const getRandomLogo = () =>
  //   `https://api.dicebear.com/8.x/icons/svg?seed=coffee`;
  return (
    <footer
      className="relative border-t border-[color:var(--color-primary)]/15 overflow-hidden"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-foreground, #fff)",
      }}
    >
      {/* Fun animated particles */}
      <FloatingShapes />
      <Sparkles />

      <div className="relative z-10 mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-start sm:justify-between gap-8">
          <div className="flex justify-center sm:justify-start mb-6 sm:mb-0">
            <p className="text-2xl font-bold sm:text-3xl">
              {siteName || "☕ A Chi Coffee Production"}
            </p>
            {/* <Avatar className="w-40 h-40">
              <AvatarImage src={getRandomLogo()} alt="@shadcn" />
              <AvatarFallback>Your Logo</AvatarFallback>
            </Avatar> */}
          </div>

          <div className="flex flex-col gap-4 items-end text-right">
            {sections && sections.length > 0 ? (
              <nav className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section) => (
                  <div key={section.label} className="flex flex-col gap-2">
                    <span className="font-semibold">{section.label}</span>
                    <div className="flex flex-col gap-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          target={item.openInNewTab ? "_blank" : undefined}
                          rel={
                            item.openInNewTab
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            ) : null}
            {socialLinks && socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-sm">
                {socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.label);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-foreground)]/30 p-2 hover:bg-[color:var(--color-primary)]/20 transition-colors"
                      aria-label={link.label}
                    >
                      <Icon
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : null}
            <LocaleSwitcher />
            <p className="mt-4 text-center text-sm lg:mt-0 lg:text-right opacity-70">
              Copyright &copy; {thisyear} {siteName}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
