import React from "react";
import { Box } from "@mui/material";

// Shared responsive blog-card grid: 3 columns on desktop, 2 on tablet,
// 1 on mobile. Used by Home and Blogs so the card surface is identical
// everywhere.
const BlogGrid = ({ children, sx }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
      gap: 3,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default BlogGrid;