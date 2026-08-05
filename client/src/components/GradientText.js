import React from "react";
import { Box } from "@mui/material";

// Reusable animated gradient text. Renders a <span> with a terracotta→amber
// gradient that slowly sweeps across (gradientShift keyframe in index.css).
// Use to highlight a phrase inside a larger heading:
//   <h2>Where great writing <GradientText>finds its readers</GradientText></h2>
const GradientText = ({ children, sx }) => (
  <Box
    component="span"
    sx={{
      background:
        "linear-gradient(90deg, #C2410C, #E8693A, #F59E0B, #E8693A, #C2410C)",
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
      animation: "gradientShift 6s linear infinite",
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default GradientText;