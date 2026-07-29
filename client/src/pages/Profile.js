<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Button, TextField, List, ListItem, ListItemButton, ListItemText,
  Chip, Typography, LinearProgress, CircularProgress, Link, Divider, Stack,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { updateUser, authActions } from '../redux/store';
=======
import React, { useState, useEffect, useRef,useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, TextField, Avatar, List, ListItem, ListItemButton, ListItemText,Chip,Typography, LinearProgress,Paper, CircularProgress,Link } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { updateUser, authActions } from '../redux/store';
import { useTheme } from '../context/ThemeContext';
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import RedeemIcon from '@mui/icons-material/CardGiftcard';
import { ToastContainer, toast, Slide, Zoom, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
<<<<<<< HEAD
import { onActivate } from "../utils/a11y";
import { validateEmail, validateMinLength, validatePassword } from "../utils/validate";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import UserAvatar from "../components/UserAvatar";
import SectionHeading from "../components/SectionHeading";
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

const Profile = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const { theme } = useTheme();
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const isWriter = user?.role?.toLowerCase() === "writer";

  const setFieldError = (field, msg) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  const fileInputRef = useRef(null);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState("Beginner");
  const [badges, setBadges] = useState([]);
  const [topWriters, setTopWriters] = useState([]);
  const [topReaders, setTopReaders] = useState([]);

  // Level thresholds mirror the server's getLevel() so the progress bar is
  // consistent with the displayed level. Each band knows its floor and the
  // points needed to reach the next level; the top band has no "next".
  const LEVEL_BANDS = [
    { min: 0, next: 500 },
    { min: 500, next: 1000 },
    { min: 1000, next: 3000 },
    { min: 3000, next: null },
  ];
  const band = LEVEL_BANDS.find((b) => points >= b.min && (b.next === null || points < b.next)) || LEVEL_BANDS[LEVEL_BANDS.length - 1];
  const isMaxLevel = band.next === null;
  const nextLevelPoints = isMaxLevel ? points : band.next;
  const progress = isMaxLevel
    ? 100
    : ((points - band.min) / (band.next - band.min)) * 100;
=======
  const isWriter = user?.role?.toLowerCase() === "writer";
  const fileInputRef = useRef(null);
  const [points,setPoints] = useState(0);
  const [level, setLevel] = useState("Beginner");
  const [badges, setBadges] = useState([]); 
  const [topWriters, setTopWriters] = useState([]);
  const [topReaders, setTopReaders] = useState([]);
  const nextLevelPoints = 100; 
  const progress = (points / nextLevelPoints) * 100;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/user/${user._id}`);
      if (response.data.success) {
        setPoints(response.data.user.points || 0);
        setLevel(response.data.user.level || "Beginner");
        setBadges(response.data.user.badges || []);
      } else {
<<<<<<< HEAD
        toast.error("Couldn't load your stats.", {
          position: "top-center", autoClose: 3000, transition: Flip,
        });
      }
    } catch (error) {
      toast.error("Couldn't load your stats.", {
        position: "top-center", autoClose: 3000, transition: Flip,
      });
=======
        console.error("Failed to fetch user stats:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
  }, [user]);

  const fetchRewards = async () => {
    setLoadingRewards(true);
    try {
      const response = await axios.get('/api/v1/rewards');
<<<<<<< HEAD

      if (response.data.success && Array.isArray(response.data.rewards)) {
        setRewards(response.data.rewards);
      } else {
        setRewards([]);
      }
    } catch (error) {
      setRewards([]);
      toast.error("Couldn't load rewards.", {
        position: "top-center", autoClose: 3000, transition: Flip,
      });
=======
  
      if (response.data.success && Array.isArray(response.data.rewards)) {
        setRewards(response.data.rewards);
      } else {
        setRewards([]); 
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      setRewards([]); 
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
    setLoadingRewards(false);
  };

  const handleRedeem = async (rewardId) => {
    try {
      const response = await axios.post('/api/v1/rewards/redeem', { userId: user._id, rewardId });
      if (response.data.success) {
<<<<<<< HEAD
        toast.success('Reward redeemed successfully!', {
          position: "top-center",
          autoClose: 3000,
          transition: Zoom,
        });
      } else {
        toast.error(response.data.message || 'Failed to redeem reward.', {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem reward.', {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    }
  };

  const fetchLeaderboard = useCallback(async () => {
=======
        alert('Reward redeemed successfully!');
      } else {
        alert('Failed to redeem reward.');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

   const fetchLeaderboard = useCallback(async () => {
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    try {
      const response = await axios.get(`/api/v1/user/leaderboard`);
      if (response.data.success) {
        setTopWriters(response.data.topWriters || []);
        setTopReaders(response.data.topReaders || []);
      }
    } catch (error) {
<<<<<<< HEAD
      toast.error("Couldn't load the leaderboard.", {
        position: "top-center", autoClose: 3000, transition: Flip,
      });
    }
  }, []);
=======
      console.error("Error fetching leaderboard:", error);
    }
  }, []);
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  useEffect(() => {
    if (user && user._id) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      fetchUserStats();
      fetchLeaderboard();
      setIsLoading(false);
      fetchRewards();
    }
<<<<<<< HEAD
  }, [user, points, fetchUserStats, fetchLeaderboard]);
=======
  }, [user, points, fetchUserStats,fetchLeaderboard]);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpdate(file);
    }
  };

  const handleUpdate = async (selectedImage = null) => {
    if (!user || !user._id) {
<<<<<<< HEAD
      toast.error("⚠️ Cannot update: User data not available.", {
        position: "top-center",
        transition: Flip,
      });
      return;
    }

    // Inline validation: username/email are required, and a new password (if
    // provided) must meet the server's 8-char minimum. Bio is free-form.
    const found = {
      username: validateMinLength(username, 2, "Username"),
      email: validateEmail(email),
      password: password.trim() ? validatePassword(password, { min: 8, required: false }) : "",
    };
    const hasErrors = Object.values(found).some(Boolean);
    setErrors(hasErrors ? found : {});
    if (hasErrors) return;

    setIsUpdating(true);
    try {
      const updatedData = { id: user._id, username, email, bio };

      if (password.trim()) {
        updatedData.password = password;
      }

      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
          const imageResponse = await fetch(`/api/v1/user/upload-image`, {
            method: 'POST',
            body: formData,
          });

          const imageData = await imageResponse.json();
          if (imageResponse.ok) {
            updatedData.profile_image = imageData.imageUrl;
          } else {
            throw new Error(imageData.message || 'Image upload failed');
          }
        } catch (error) {
          toast.error('Failed to upload image');
          return;
        }
      }

      // updateUser is a createAsyncThunk; unwrap() throws on rejection so we
      // only show success when the server actually persisted the change.
      await dispatch(updateUser(updatedData)).unwrap();
      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        transition: Zoom,
      });
      // Clear the password field after a successful update.
      setPassword('');
    } catch (error) {
      toast.error(error?.message || "Failed to update profile.", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    } finally {
      setIsUpdating(false);
    }
  };
=======
        toast.error("⚠️ Cannot update: User data not available.", {
            position: "top-center",
            transition: Flip,
        });
      return;
    }

    const updatedData = { id: user._id, username, email, bio };

    if (password.trim()) {
      updatedData.password = password;
    }

    if (selectedImage) {
      const formData = new FormData();
      formData.append('image', selectedImage);

      try {
        const imageResponse = await fetch(`/api/v1/user/upload-image`, {
          method: 'POST',
          body: formData,
        });

        const imageData = await imageResponse.json();
        if (imageResponse.ok) {
          updatedData.profile_image = imageData.imageUrl;
        } else {
          throw new Error(imageData.message || 'Image upload failed');
        }
      } catch (error) {
        toast.error('Failed to upload image');
        return;
      }
    }

    dispatch(updateUser(updatedData));
    toast.success("Profile updated successfully!", {
      position: "top-center",
      autoClose: 3000,
      transition: Zoom,
  });
};
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/");
  };

  const handleRestrictedNavigation = (path) => {
    if (isWriter) {
      navigate(path);
    } else {
      toast.error("Login as a writer to access this feature");
    }
  };

<<<<<<< HEAD
  const navItem = (label, icon, onClick, active = false) => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          color: active ? "primary.main" : "text.secondary",
          fontWeight: active ? 700 : 500,
          "&:hover": { bgcolor: "brandSoft" },
        }}
      >
        <Box sx={{ mr: 1.5, color: active ? "primary.main" : "text.secondary", display: "flex" }}>{icon}</Box>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );

  const LeaderboardCard = ({ title, emoji, rows }) => (
    <GlassCard sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle2" sx={{ textAlign: "center", color: "primary.main", fontWeight: 700, mb: 1 }}>
        {emoji} {title}
      </Typography>
      {rows.length > 0 ? (
        rows.map((entry, index) => (
          <ListItem key={entry._id} disableGutters sx={{ py: 0.25 }}>
            <ListItemText
              primary={`${index + 1}. ${entry.username}`}
              secondary={`${entry.points} Points`}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        ))
      ) : (
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
          No {title.toLowerCase()} yet.
        </Typography>
      )}
    </GlassCard>
  );

  return (
    <>
      <ToastContainer
=======
  return (
    <>
    <ToastContainer
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
<<<<<<< HEAD
      />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", md: 260 },
            p: 2,
            borderRight: { md: `1px solid`, borderColor: { md: "divider" } },
          }}
        >
          <List>
            {navItem("Profile", <AccountCircleIcon fontSize="small" />, () => navigate('/profile'), true)}
            {navItem("My Blogs", <ArticleIcon fontSize="small" />, () => handleRestrictedNavigation('/my-blogs'))}
            {navItem("Create Blog", <AddCircleIcon fontSize="small" />, () => handleRestrictedNavigation('/create-blog'))}
            {navItem("Rewards", <RedeemIcon fontSize="small" />, () => navigate('/rewards'))}
            {navItem("Leaderboard", <LeaderboardIcon fontSize="small" />, () => {})}
          </List>

          <LeaderboardCard title="Top Writers" emoji="✍️" rows={topWriters} />
          <LeaderboardCard title="Top Readers" emoji="📖" rows={topReaders} />

          <List sx={{ mt: 2 }}>
            {navItem("Logout", <ExitToAppIcon fontSize="small" />, handleLogout)}
          </List>
        </Box>

        {/* Main */}
        <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
          <SectionHeading eyebrow="Your account" title="Profile" align="left" sx={{ mb: 4 }} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, maxWidth: 640, mx: "auto" }}>
            <UserAvatar
              src={user?.profile_image}
              name={user?.username}
              alt="Your profile picture"
              role="button"
              tabIndex={0}
              sx={{
                width: 110,
                height: 110,
                fontSize: "2rem",
                cursor: 'pointer',
                border: "3px solid",
                borderColor: "primary.main",
                boxShadow: (t) => t.customShadows?.glow,
                transition: "box-shadow 0.3s ease",
                "&:hover": { boxShadow: (t) => t.customShadows?.cardHover },
              }}
              onClick={handleAvatarClick}
              onKeyDown={onActivate(handleAvatarClick)}
            />
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />

            {/* Header card: role badge + level + points + progress */}
            <GlassCard sx={{ p: 4, width: "100%", textAlign: "center" }}>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                <Chip label={user?.role || "Reader"} color="secondary" size="small" />
                <Chip label={level} color="primary" size="small" />
              </Stack>

              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}>
                {points} <Box component="span" sx={{ color: "text.secondary", fontSize: "1rem", fontWeight: 500 }}>points</Box>
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5, mt: 2, bgcolor: "divider" }}
              />

              <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
                {isMaxLevel ? "Max level reached 🏆" : `${progress.toFixed(1)}% to ${nextLevelPoints} points`}
              </Typography>
            </GlassCard>

            {/* Badges */}
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>🏅 Badges Earned</Typography>
              {badges.length > 0 ? (
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                  {badges.map((badge, index) => (
                    <Chip key={index} label={badge} color="primary" variant="outlined" sx={{ m: 0.5 }} />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>No badges yet. Keep engaging!</Typography>
              )}
            </Box>

            {/* Rewards */}
            <GlassCard sx={{ p: 3, width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Rewards</Typography>
              {loadingRewards ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}><CircularProgress size={28} /></Box>
              ) : Array.isArray(rewards) && rewards.length > 0 ? (
                <List disablePadding>
                  {rewards.map(reward => (
                    <ListItem key={reward._id} disableGutters sx={{ py: 1 }}>
                      <ListItemText
                        primary={reward.name}
                        secondary={`Cost: ${reward.costInPoints} Points`}
                        primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        disabled={user.points < reward.costInPoints}
                        onClick={() => handleRedeem(reward._id)}
                      >
                        Redeem
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>No rewards available yet.</Typography>
              )}
            </GlassCard>

            {/* Edit form */}
            <GlassCard sx={{ p: { xs: 3, md: 4 }, width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Edit profile</Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldError("username", ""); }}
                onBlur={() => setFieldError("username", validateMinLength(username, 2, "Username"))}
                error={Boolean(errors.username)}
                helperText={errors.username}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError("email", ""); }}
                onBlur={() => setFieldError("email", validateEmail(email))}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Bio"
                multiline
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Enter new password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldError("password", ""); }}
                onBlur={() => setFieldError("password", password.trim() ? validatePassword(password, { min: 8, required: false }) : "")}
                error={Boolean(errors.password)}
                helperText={errors.password || "Leave blank to keep your current password."}
              />
              <GradientButton
                sx={{ mt: 3, py: 1.25 }}
                onClick={() => handleUpdate()}
                disabled={isLoading || isUpdating}
              >
                {isUpdating ? "Updating…" : "Update Profile"}
              </GradientButton>
            </GlassCard>
          </Box>
        </Box>
      </Box>
=======
        toastStyle={{
          backgroundColor: "#1E1E1E",  
          color: "#FFFFFF", 
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0, 255, 255, 0.3)",
      }}
    />
    <Box display="flex" height="100vh">
      <Box
  width="240px"
  p={2}
  sx={{
    bgcolor: theme === 'dark' ? '#1E1E1E' : '#E3F2FD',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/profile')}>
            <AccountCircleIcon sx={{ marginRight: 1, color: 'cyan' }} />
            <ListItemText primary="Profile" sx={{ color: 'inherit' }} />
            </ListItemButton>
          </ListItem>
          
         <ListItem disablePadding>
            <ListItemButton onClick={() => handleRestrictedNavigation('/my-blogs')}>
              <ArticleIcon sx={{ marginRight: 1, color: 'orange' }} />
              <ListItemText primary="My Blogs" sx={{ color: 'inherit' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleRestrictedNavigation('/create-blog')}>
              <AddCircleIcon sx={{ marginRight: 1, color: 'limegreen' }} />
              <ListItemText primary="Create Blog" sx={{ color: 'inherit' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
          <ListItemButton component={Link} to="/rewards">
    <RedeemIcon sx={{ marginRight: 1, color: 'Aquamarine' }} /> 
    <ListItemText primary="Rewards" sx={{ color: 'inherit' }} />
  </ListItemButton>
</ListItem>
          
          <ListItem disablePadding>
            <ListItemButton>
              <LeaderboardIcon sx={{ marginRight: 1, color: 'gold' }} />
              <ListItemText primary="Leaderboard" />
            </ListItemButton>
          </ListItem>

<Box mt={2} p={1} 
  sx={{ 
    bgcolor: theme === 'dark' ? '#2E2E2E' : '#fff', 
    color: theme === 'dark' ? '#fff' : '#000',
    borderRadius: 1 
  }}>
  <Typography variant="h6" sx={{ textAlign: "center", color: theme === 'dark' ? 'cyan' : 'black' }}>
    ✍️ Top Writers
  </Typography>
  {topWriters.length > 0 ? (
    topWriters.map((writer, index) => (
      <ListItem key={writer._id} disablePadding>
        <ListItemText 
          primary={`${index + 1}. ${writer.username}`} 
          secondary={`${writer.points} Points`} 
          sx={{ color: theme === 'dark' ? '#fff' : '#000' }} 
        />
      </ListItem>
    ))
  ) : (
    <Typography variant="body2" sx={{ textAlign: "center", color: theme === 'dark' ? '#fff' : '#000' }}>
      No top writers yet.
    </Typography>
  )}
</Box>

<Box mt={2} p={1} 
  sx={{ 
    bgcolor: theme === 'dark' ? '#2E2E2E' : '#fff', 
    color: theme === 'dark' ? '#fff' : '#000',
    borderRadius: 1 
  }}>
  <Typography variant="h6" sx={{ textAlign: "center", color: theme === 'dark' ? 'cyan' : 'black' }}>
    📖 Top Readers
  </Typography>
  {topReaders.length > 0 ? (
    topReaders.map((reader, index) => (
      <ListItem key={reader._id} disablePadding>
        <ListItemText 
          primary={`${index + 1}. ${reader.username}`} 
          secondary={`${reader.points} Points`} 
          sx={{ color: theme === 'dark' ? '#fff' : '#000' }} 
        />
      </ListItem>
    ))
  ) : (
    <Typography variant="body2" sx={{ textAlign: "center", color: theme === 'dark' ? '#fff' : '#000' }}>
      No top readers yet.
    </Typography>
  )}
</Box>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
            <ExitToAppIcon sx={{ marginRight: 1, color: "red" }} />
            <ListItemText primary="LOGOUT" sx={{ fontWeight: "bold", color: "inherit" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box flexGrow={1} p={3}>
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <Avatar
            src={user?.profile_image || "/default-avatar.png"}
            sx={{
              width: 110,
              height: 110,
              mb: 2,
              cursor: 'pointer',
              border: "3px solid transparent",
              transition: "border 0.3s ease, box-shadow 0.3s ease",
              boxShadow: theme === 'dark'
                ? "0px 0px 15px rgba(0, 255, 255, 0.7)"
                : "0px 0px 10px rgba(0, 0, 255, 0.4)",
              "&:hover": {
                border: theme === 'dark' ? "3px solid cyan" : "3px solid blue",
                boxShadow: theme === 'dark'
                  ? "0px 0px 35px rgba(0, 255, 255, 0.9)"
                  : "0px 0px 15px rgba(0, 0, 255, 0.6)"
              }
            }}
            onClick={handleAvatarClick}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
<Paper 
  elevation={4} 
  sx={{ 
    maxWidth: 450, 
    padding: 4, 
    borderRadius: 3, 
    textAlign: "center", 
    background: "rgba(30, 30, 30, 0.9)", 
    backdropFilter: "blur(8px)", 
    boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.3)",
    border: "2px solid rgba(0, 255, 255, 0.4)",
    color: "white",
  }}
>

 <Typography 
  variant="h6" 
  sx={{ fontWeight: "bold", textShadow: "0px 1px 1px cyan" }}
>
  🎯 Level: {level}
</Typography>

<Typography 
  variant="h5" 
  sx={{ mt: 1, fontWeight: "bold", letterSpacing: "1px" }}
>
  {points} Points
</Typography>

<LinearProgress 
  variant="determinate" 
  value={progress} 
  sx={{ 
    height: 9, 
    borderRadius: 5, 
    backgroundColor: "#444", 
    "& .MuiLinearProgress-bar": { 
      background: "linear-gradient(90deg, cyan, blue)", 
      transition: "width 1s ease-in-out"
    },
  }} 
/>

<Typography 
  variant="caption" 
  sx={{ 
    mt: 1, 
    display: "block", 
    fontWeight: "bold", 
    color: "rgba(0, 255, 255, 0.8)" 
  }}
>
  {progress.toFixed(1)}% to next level
</Typography>

</Paper>

<Box mt={3} textAlign="center">
  <Typography variant="h6">🏅 Badges Earned:</Typography>
  {badges.length > 0 ? (
    badges.map((badge, index) => (
      <Chip 
        key={index} 
        label={badge} 
        sx={{ 
          m: 0.5, 
          bgcolor: "gold", 
          color: "#000", 
          fontWeight: "bold", 
          boxShadow: "0px 3px 6px rgba(0,0,0,0.2)" 
        }} 
      />
    ))
  ) : (
    <Typography variant="body2">No badges yet. Keep engaging!</Typography>
  )}
</Box>

{loadingRewards ? (
  <CircularProgress />
) : Array.isArray(rewards) && rewards.length > 0 ? ( 
  <List>
    {rewards.map(reward => (
      <ListItem key={reward._id}>
        <ListItemText primary={reward.name} secondary={`Cost: ${reward.costInPoints} Points`} />
        <Button 
          variant="contained" 
          color="primary" 
          disabled={user.points < reward.costInPoints} 
          onClick={() => handleRedeem(reward._id)}
        >
          Redeem
        </Button>
      </ListItem>
    ))}
  </List>
) : (
  <Typography></Typography> 
)}

          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Bio"
            variant="outlined"
            multiline
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Enter new password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => handleUpdate()}
            disabled={isLoading}
          >
            Update
          </Button>
        </Box>
      </Box>
    </Box>
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    </>
  );
};

export default Profile;