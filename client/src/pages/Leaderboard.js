import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Box, Tabs, Tab, ToggleButtonGroup, ToggleButton, CircularProgress, Typography, Stack } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SectionHeading from "../components/SectionHeading";
import LeaderboardCard from "../components/LeaderboardCard";
import { useAuth } from "../context/AuthContext";

const PERIODS = [
  { key: "all", label: "All Time" },
  { key: "month", label: "This Month" },
  { key: "week", label: "This Week" },
];

// Standalone leaderboard with All-time / Monthly / Weekly period tabs and a
// Writers / Readers toggle. Reuses the shared LeaderboardCard so the ranking
// surface is identical to the Profile sidebar, and highlights the signed-in
// user's row.
const Leaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("all");
  const [group, setGroup] = useState("writers"); // writers | readers
  const [data, setData] = useState({ topWriters: [], topReaders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLeaderboard = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`/api/v1/user/leaderboard?period=${p}`);
      if (res.success) {
        setData({ topWriters: res.topWriters || [], topReaders: res.topReaders || [] });
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const rows = group === "writers" ? data.topWriters : data.topReaders;

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <SectionHeading
        eyebrow="The scoreboard"
        title="Leaderboard"
        subtitle="Top writers and readers — by all-time points or the last 30 / 7 days."
        badge
        align="left"
        sx={{ mb: 3 }}
      />

      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {/* Period tabs */}
        <Tabs
          value={period}
          onChange={(_, v) => setPeriod(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {PERIODS.map((p) => (
            <Tab key={p.key} value={p.key} label={p.label} />
          ))}
        </Tabs>

        {/* Writers / Readers toggle */}
        <ToggleButtonGroup
          value={group}
          exclusive
          onChange={(_, v) => v && setGroup(v)}
          size="small"
          sx={{ mb: 2, display: "flex", justifyContent: "center" }}
        >
          <ToggleButton value="writers" sx={{ textTransform: "none", fontWeight: 700 }}>✍️ Writers</ToggleButton>
          <ToggleButton value="readers" sx={{ textTransform: "none", fontWeight: 700 }}>📖 Readers</ToggleButton>
        </ToggleButtonGroup>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Couldn’t load the leaderboard. Please try again.
          </Typography>
        ) : rows.length === 0 ? (
          <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
            <EmojiEventsIcon sx={{ fontSize: 44, color: "text.secondary" }} />
            <Typography variant="h6">No {group} on the board yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {period === "all"
                ? "Start writing and engaging to claim a spot."
                : "No activity in this window — keep going!"}
            </Typography>
          </Stack>
        ) : (
          <LeaderboardCard
            title={group === "writers" ? "Top Writers" : "Top Readers"}
            emoji={group === "writers" ? "✍️" : "📖"}
            rows={rows}
            currentUserId={user?._id}
          />
        )}
      </Box>
    </Box>
  );
};

export default Leaderboard;