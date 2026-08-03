import React from "react";
import { ListItem, ListItemText, Typography } from "@mui/material";
import GlassCard from "./GlassCard";

// Level thresholds mirror the server's getLevel() so any progress bar / band
// logic stays consistent with the displayed level. Exported so both the Profile
// progress ring and the Leaderboard page share one source of truth.
export const LEVEL_BANDS = [
  { min: 0, next: 500 },
  { min: 500, next: 1000 },
  { min: 1000, next: 3000 },
  { min: 3000, next: null },
];

// Shared leaderboard list card used by both the Profile sidebar and the
// standalone Leaderboard page. `currentUserId` (optional) highlights the
// signed-in user's row so they can spot themselves in the rankings.
const LeaderboardCard = ({ title, emoji, rows, currentUserId }) => (
  <GlassCard sx={{ p: 2, mt: 2 }}>
    <Typography variant="subtitle2" sx={{ textAlign: "center", color: "primary.main", fontWeight: 700, mb: 1 }}>
      {emoji} {title}
    </Typography>
      {rows.length > 0 ? (
        rows.map((entry, index) => {
          const isMe = currentUserId && String(entry._id) === String(currentUserId);
          return (
            <ListItem
              key={entry._id}
              disableGutters
              sx={{
                py: 0.25,
                px: 1,
                borderRadius: 1,
                bgcolor: isMe ? "brandSoft" : "transparent",
              }}
            >
              <ListItemText
                primary={`${index + 1}. ${entry.username}${isMe ? " (you)" : ""}`}
                secondary={`${entry.points} Points`}
                primaryTypographyProps={{
                  variant: "body2",
                  sx: { fontWeight: isMe ? 700 : 500, color: isMe ? "primary.main" : "text.primary" },
                }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          );
        })
      ) : (
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
          No {title.toLowerCase()} yet.
        </Typography>
      )}
  </GlassCard>
);

export default LeaderboardCard;