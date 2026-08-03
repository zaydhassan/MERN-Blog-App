import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppBar, Toolbar, IconButton, Button, MenuItem, Menu, Drawer, Box, Stack, Container, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ArticleIcon from "@mui/icons-material/Article";
import PostAddIcon from "@mui/icons-material/PostAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import GradientButton from "./GradientButton";
import UserAvatar from "./UserAvatar";
import BrandLogo from "./BrandLogo";
import NotificationBell from "./NotificationBell";
import { authActions, fetchUnreadCount } from "../redux/store";

const NAV_ITEMS = [
  { label: "Home", path: "/", match: (p) => p === "/" },
  { label: "About", path: "/about", match: (p) => p === "/about" },
  { label: "Blogs", path: "/blogs", match: (p) => p.startsWith("/blogs") || p.startsWith("/category") },
  { label: "Leaderboard", path: "/leaderboard", match: (p) => p.startsWith("/leaderboard") },
  { label: "Contact", path: "/contact", match: (p) => p === "/contact" },
];

// Filled-pill active state (brandSoft bg + terracotta text) reads more
// "premium SaaS" than a thin under-bar, and stays legible in both modes.
const navBtnSx = (active) => ({
  color: active ? "primary.main" : "text.secondary",
  fontWeight: active ? 700 : 600,
  textTransform: "none",
  borderRadius: 999,
  px: { xs: 1.5, md: 2 },
  py: 0.75,
  minWidth: "auto",
  transition: "color .2s ease, background-color .2s ease",
  "&:hover": { color: "primary.main", backgroundColor: "brandSoft" },
  ...(active ? { backgroundColor: "brandSoft" } : {}),
});

const Navbar = () => {
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth.isLogin);
  const user = useSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll-aware elevation: the floating pill gains a soft card shadow once
  // the page is scrolled, so it reads as lifted over content.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close both the avatar menu and the mobile drawer on route change.
  useEffect(() => {
    setAnchorEl(null);
    setMobileOpen(false);
  }, [location]);

  // Poll the unread-notification count for the bell badge while logged in:
  // once on mount and every 60s. Clears the interval on logout/unmount so we
  // never hit the authed endpoint as an anonymous user.
  useEffect(() => {
    if (!isLogin) return;
    dispatch(fetchUnreadCount());
    const id = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(id);
  }, [isLogin, dispatch]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenu = (event) => { event.stopPropagation(); setAnchorEl(event.currentTarget); };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    // Unified logout: clears the refresh cookie (server), Firebase session,
    // and local auth state, then syncs the Redux store.
    await logout();
    dispatch(authActions.logout());
    toast.success("Logged out Successfully");
    navigate("/");
  };

  const handleNavigation = (path) => (isLogin ? navigate(path) : navigate("/login"));

  // Profile dropdown items. Each carries its own icon; Analytics is
  // writer/admin-only. Logout is rendered separately below a divider.
  const menuItems = [
    { icon: <AccountCircleIcon fontSize="small" />, label: "Profile", onClick: () => navigate("/profile") },
    { icon: <NotificationsIcon fontSize="small" />, label: "Notifications", onClick: () => navigate("/notifications") },
    { icon: <BookmarkBorderIcon fontSize="small" />, label: "Bookmarks", onClick: () => navigate("/bookmarks") },
    { icon: <HistoryIcon fontSize="small" />, label: "Reading History", onClick: () => navigate("/reading-history") },
    { icon: <BarChartIcon fontSize="small" />, label: "Analytics", onClick: () => navigate("/analytics"), show: user?.role === "Writer" || user?.role === "Admin" },
    { icon: <LeaderboardIcon fontSize="small" />, label: "Leaderboard", onClick: () => navigate("/leaderboard") },
    { icon: <ArticleIcon fontSize="small" />, label: "My Blogs", onClick: () => handleNavigation("/my-blogs") },
    { icon: <PostAddIcon fontSize="small" />, label: "Create Blog", onClick: () => handleNavigation("/create-blog") },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      // Neutralize the global glass-AppBar override so the floating pill below
      // is the only glass surface (the bar itself is fully transparent).
      sx={{
        bgcolor: "transparent !important",
        backgroundImage: "none !important",
        boxShadow: "none !important",
        borderBottom: "none !important",
        backdropFilter: "none !important",
        WebkitBackdropFilter: "none !important",
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, md: 2.5 } }}>
        <motion.div
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Toolbar
            disableGutters
            sx={{
              my: { xs: 1.25, md: 1.75 },
              px: { xs: 1.5, md: 2 },
              py: 0.75,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              bgcolor: "background.glass",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: scrolled
                ? (t) => t.customShadows?.card || "0 12px 36px rgba(0,0,0,0.12)"
                : "0 1px 2px rgba(0,0,0,0.04)",
              transition: "box-shadow .35s ease, margin .35s ease",
            }}
          >
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ display: { md: "none" } }} onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>

            <Box
              onClick={() => navigate("/")}
              role="button"
              aria-label="Inkwell home"
              tabIndex={0}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 2,
                p: 0.5,
                transition: "opacity .2s ease, transform .2s ease",
                "&:hover": { opacity: 0.92, transform: "translateY(-1px)" },
              }}
            >
              <BrandLogo size={38} />
            </Box>

            <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, justifyContent: "center", display: { xs: "none", md: "flex" } }}>
              {NAV_ITEMS.map((item) => {
                const active = item.match(location.pathname);
                return (
                  <Button key={item.label} sx={navBtnSx(active)} onClick={() => navigate(item.path)}>
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            {/* Spacer keeps the actions right-aligned on mobile when the nav row is hidden. */}
            <Box sx={{ flexGrow: 1, display: { xs: "block", md: "none" } }} />

            <Drawer
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              PaperProps={{ sx: { width: 280, p: 2.5 } }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ px: 1, py: 1, mb: 2 }}>
                  <BrandLogo size={34} onClick={() => { navigate("/"); setMobileOpen(false); }} />
                </Box>
                <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                  {NAV_ITEMS.map((item) => {
                    const active = item.match(location.pathname);
                    return (
                      <Button
                        key={item.label}
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          fontWeight: active ? 700 : 600,
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                          color: active ? "primary.main" : "text.secondary",
                          backgroundColor: active ? "brandSoft" : "transparent",
                          "&:hover": { backgroundColor: "brandSoft", color: "primary.main" },
                        }}
                        onClick={() => (item.label === "Blogs" ? handleNavigation(item.path) : navigate(item.path))}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                  {isLogin && (
                    <Button
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontWeight: location.pathname === "/notifications" ? 700 : 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        color: location.pathname === "/notifications" ? "primary.main" : "text.secondary",
                        backgroundColor: location.pathname === "/notifications" ? "brandSoft" : "transparent",
                        "&:hover": { backgroundColor: "brandSoft", color: "primary.main" },
                      }}
                      onClick={() => { navigate("/notifications"); setMobileOpen(false); }}
                    >
                      Notifications
                    </Button>
                  )}
                  {isLogin && (
                    <Button
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontWeight: location.pathname === "/bookmarks" ? 700 : 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        color: location.pathname === "/bookmarks" ? "primary.main" : "text.secondary",
                        backgroundColor: location.pathname === "/bookmarks" ? "brandSoft" : "transparent",
                        "&:hover": { backgroundColor: "brandSoft", color: "primary.main" },
                      }}
                      onClick={() => { navigate("/bookmarks"); setMobileOpen(false); }}
                    >
                      Bookmarks
                    </Button>
                  )}
                  {isLogin && (
                    <Button
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontWeight: location.pathname === "/reading-history" ? 700 : 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        color: location.pathname === "/reading-history" ? "primary.main" : "text.secondary",
                        backgroundColor: location.pathname === "/reading-history" ? "brandSoft" : "transparent",
                        "&:hover": { backgroundColor: "brandSoft", color: "primary.main" },
                      }}
                      onClick={() => { navigate("/reading-history"); setMobileOpen(false); }}
                    >
                      Reading History
                    </Button>
                  )}
                  {isLogin && (user?.role === "Writer" || user?.role === "Admin") && (
                    <Button
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontWeight: location.pathname === "/analytics" ? 700 : 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        color: location.pathname === "/analytics" ? "primary.main" : "text.secondary",
                        backgroundColor: location.pathname === "/analytics" ? "brandSoft" : "transparent",
                        "&:hover": { backgroundColor: "brandSoft", color: "primary.main" },
                      }}
                      onClick={() => { navigate("/analytics"); setMobileOpen(false); }}
                    >
                      Analytics
                    </Button>
                  )}
                </Stack>
              </Box>
            </Drawer>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {isLogin && (
                <>
                  <NotificationBell />
                  <IconButton
                    onClick={() => navigate("/bookmarks")}
                    color="inherit"
                    aria-label="Bookmarks"
                    sx={{ borderRadius: 999, "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <BookmarkBorderIcon />
                  </IconButton>
                  <IconButton
                    onClick={toggleTheme}
                    color="inherit"
                    aria-label="Toggle light/dark theme"
                    sx={{ borderRadius: 999, "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    {theme === "light" ? <Brightness5Icon /> : <NightsStayIcon />}
                  </IconButton>
                  <IconButton onClick={handleMenu} aria-label="Account menu" sx={{ p: 0, borderRadius: 999 }}>
                    <UserAvatar
                      src={user?.profile_image}
                      name={user?.username}
                      alt="Profile"
                      sx={{ width: 40, height: 40, border: (t) => `2px solid ${t.palette.primary.main}` }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    slotProps={{ paper: { sx: { mt: 1.5, borderRadius: 3, overflow: "hidden", minWidth: 220 } } }}
                  >
                    {menuItems.filter((item) => item.show !== false).map((item) => (
                      <MenuItem
                        key={item.label}
                        onClick={() => { item.onClick(); handleClose(); }}
                        sx={{ py: 1.25 }}
                      >
                        <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.25, color: "error.main" }}>
                      <ListItemIcon sx={{ color: "error.main", minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                    </MenuItem>
                  </Menu>
                </>
              )}
              {!isLogin && (
                <GradientButton
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 999,
                    px: 2.75,
                    py: 0.9,
                    minHeight: 0,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.01em",
                    boxShadow: (t) => t.customShadows?.card,
                    "&:hover": {
                      boxShadow: (t) => t.customShadows?.cardHover,
                    },
                  }}
                >
                  Login
                </GradientButton>
              )}
            </Box>
          </Toolbar>
        </motion.div>
      </Container>
    </AppBar>
  );
};

export default Navbar;