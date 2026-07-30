import React, { useState, useEffect } from "react";
import { Box, LinearProgress } from "@mui/material";

// A thin fixed progress bar at the very top of the viewport that fills as the
// reader scrolls through the article body. Progress is 0 until the top of the
// `.blog-content` box reaches the top of the viewport, and 1 once the bottom of
// the box reaches the bottom of the viewport — so it reflects "how much of the
// article has passed by", not raw page scroll.
//
// Pass a ref to the article body element. The scroll listener is passive and
// cleaned up on unmount.
const ReadingProgress = ({ contentRef }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef?.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height;
      // Distance the viewport must travel from "box top at viewport top" to
      // "box bottom at viewport bottom".
      const distance = total - window.innerHeight;
      if (distance <= 0) {
        // Article shorter than the viewport: fully "read" once in view.
        setProgress(rect.bottom > 0 && rect.top < window.innerHeight ? 100 : 0);
        return;
      }
      const scrolled = -rect.top; // > 0 once the box top is above the viewport top
      const pct = Math.min(100, Math.max(0, (scrolled / distance) * 100));
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [contentRef]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        zIndex: 1300, // above the sticky AppBar (1100) so it reads as a top edge
        bgcolor: "transparent",
      }}
      aria-hidden="true"
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 0,
          bgcolor: "transparent",
          "& .MuiLinearProgress-bar": { borderRadius: 0 },
        }}
      />
    </Box>
  );
};

export default ReadingProgress;