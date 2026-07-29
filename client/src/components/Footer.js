import React from "react";
import { Box, Container, Typography, IconButton, Link as MuiLink, Divider, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import GradientButton from "./GradientButton";
import BrandLogo from "./BrandLogo";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import EmailIcon from "@mui/icons-material/Email";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Blogs", to: "/blogs" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "Profile", to: "/profile" },
      { label: "My Blogs", to: "/my-blogs" },
    ],
  },
  {
    title: "Writer",
    links: [
      { label: "Create Blog", to: "/create-blog" },
      { label: "Rewards", to: "/rewards" },
    ],
  },
];

const Footer = () => {
  const { theme, toggleTheme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "background.glass",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" },
            gap: 5,
          }}
        >
          {/* Brand */}
          <Box>
            <BrandLogo size={40} showTagline />
            <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", maxWidth: 320 }}>
              A modern home for writers and readers. Publish, engage, and earn
              your way up the leaderboard.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton aria-label="Email" size="small"><EmailIcon fontSize="small" /></IconButton>
              <IconButton
                aria-label="Toggle light/dark theme"
                onClick={toggleTheme}
                size="small"
              >
                {theme === "dark" ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Stack>
          </Box>

          {/* Link columns */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {columns.map((col) => (
              <Box key={col.title}>
                <Typography variant="overline" sx={{ color: "text.secondary" }}>
                  {col.title}
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {col.links.map((l) => (
                    <MuiLink
                      key={l.label}
                      component={Link}
                      to={l.to}
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "color .2s ease",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {l.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © {year} Inkwell. Crafted for writers.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            Built with the MERN stack
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;