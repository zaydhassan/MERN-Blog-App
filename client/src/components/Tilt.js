import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";

// A reusable 3D tilt wrapper: the element leans toward the cursor on hover
// and springs back to flat on leave. Only adds rotateX/rotateY (+ a faint
// glare) so it composes cleanly with a card's own lift/scale hover.
// Honors prefers-reduced-motion (renders a plain div, no tilt).
//
//   <Tilt><BlogCard ... /></Tilt>
const Tilt = ({ children, max = 8, glare = true }) => {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Pointer position across the surface (-0.5 → 0.5), springed for weight.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sxp = useSpring(px, { stiffness: 200, damping: 18 });
  const syp = useSpring(py, { stiffness: 200, damping: 18 });

  const rotateX = useTransform(syp, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sxp, [-0.5, 0.5], [-max, max]);

  // Glare: a soft radial highlight that tracks the pointer and fades in only
  // while hovering. All motion values are created unconditionally (rules of
  // hooks), then read inside the conditional render.
  const glareX = useTransform(sxp, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(syp, [-0.5, 0.5], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.20), transparent 55%)`;
  const hover = useMotionValue(0);
  const glareOpacity = useSpring(hover, { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleEnter = () => hover.set(1);
  const handleLeave = () => {
    hover.set(0);
    px.set(0);
    py.set(0);
  };

  if (!enabled) return <Box sx={{ height: "100%" }}>{children}</Box>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        height: "100%",
        position: "relative",
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: glareBg,
            opacity: glareOpacity,
            mixBlendMode: "soft-light",
          }}
        />
      )}
    </motion.div>
  );
};

export default Tilt;