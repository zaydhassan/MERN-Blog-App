import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";
import GlassCard from "./GlassCard";

// Premium skeleton that mirrors the real/placeholder card layout exactly:
// cover image, category + trending badges, title, two-line description, and
// a meta row (avatar + name + stats). MUI's `wave` shimmer does the base
// sweep; a slow diagonal gradient overlay adds the high-end "sheen" pass
// you'd see on Linear/Vercel loading states.
const SkeletonBlogCard = () => (
  <GlassCard sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <Box sx={{ position: "relative", height: 180 }}>
      <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" sx={{ bgcolor: "divider" }} />
      {/* Sheen sweep */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
          backgroundSize: "220% 100%",
          animation: "skeletonSheen 1.6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Skeleton
        variant="rounded"
        width={92}
        height={24}
        sx={{ position: "absolute", top: 12, left: 12, bgcolor: "divider" }}
        animation="wave"
      />
    </Box>

    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.25, flex: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: "1.15rem" }} animation="wave" />
      <Skeleton variant="text" width="92%" animation="wave" />
      <Skeleton variant="text" width="68%" animation="wave" />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: "auto", pt: 1.5 }}>
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" animation="wave" />
        </Box>
        <Skeleton variant="rounded" width={56} height={20} animation="wave" />
      </Stack>
    </Box>
  </GlassCard>
);

export default SkeletonBlogCard;