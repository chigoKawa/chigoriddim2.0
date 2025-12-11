"use client";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

type ScrollProgressBarProps = {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
};

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  color = "#09f",
  height = 4,
  position = "top",
}) => {
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  useEffect(() => {
    controls.start({ width: `${progress * 100}%` });
  }, [progress, controls]);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        [position]: 0,
        height,
        backgroundColor: "transparent",
        zIndex: 9999,
      }}
    >
      <motion.div
        animate={controls}
        initial={{ width: "0%" }}
        style={{
          height: "100%",
          backgroundColor: color,
        }}
        transition={{ ease: "easeOut", duration: 0.2 }}
      />
    </div>
  );
};

export default ScrollProgressBar;
