<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Chip, Stack } from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import axios from 'axios';
import GlassCard from "../components/GlassCard";
import SectionHeading from "../components/SectionHeading";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get('/api/v1/rewards');
        if (response.data.success && Array.isArray(response.data.rewards)) {
          setRewards(response.data.rewards);
        } else {
          setRewards([]);
        }
      } catch (error) {
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <SectionHeading
        eyebrow="Spend your points"
        title="Rewards"
        subtitle="Redeem the points you've earned for perks."
        badge
        align="left"
        sx={{ mb: 4 }}
      />

      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : rewards.length > 0 ? (
          <Stack spacing={2}>
            {rewards.map(reward => (
              <GlassCard key={reward._id} glowOnHover sx={{ p: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 48, height: 48, borderRadius: 2, bgcolor: "brandSoft", color: "primary.main",
                    }}>
                      <CardGiftcardIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{reward.name}</Typography>
                      <Chip
                        size="small"
                        label={`${reward.costInPoints} points`}
                        color="secondary"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Stack>
                  <Button variant="contained" color="primary">
                    Redeem
                  </Button>
                </Stack>
              </GlassCard>
            ))}
          </Stack>
        ) : (
          <GlassCard sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>No rewards available</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Check back soon — new rewards are added regularly.
            </Typography>
          </GlassCard>
        )}
      </Box>
    </Box>
  );
};

export default Rewards;
=======
import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Paper, CircularProgress } from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import axios from 'axios';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get('/api/v1/rewards');
        if (response.data.success && Array.isArray(response.data.rewards)) {
          setRewards(response.data.rewards);
        } else {
          setRewards([]);
        }
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4} sx={{ minHeight: "100vh", bgcolor: "#f4f4f4" }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 600, width: "100%", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CardGiftcardIcon sx={{ fontSize: 40, mr: 1, color: "purple" }} />
          Available Rewards
        </Typography>
        
        {loading ? (
          <CircularProgress />
        ) : rewards.length > 0 ? (
          <List>
            {rewards.map(reward => (
              <ListItem key={reward._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                <ListItemText primary={reward.name} secondary={`Cost: ${reward.costInPoints} Points`} />
                <Button variant="contained" color="primary">
                  Redeem
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No rewards available.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Rewards;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
