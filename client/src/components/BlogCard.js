import React from "react";
<<<<<<< HEAD
import { CardMedia, Typography, Box, Chip, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import moment from "moment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import UserAvatar from "./UserAvatar";

const BlogCard = ({ id, title, description, image, username, profileImage, time, tags }) => {
  const navigate = useNavigate();

=======
import { Card, CardMedia, Typography, Box, Button, Chip, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import moment from "moment";
import { useTheme } from "@mui/material/styles";

const BlogCard = ({ id, title, description, image, username, profileImage, time, tags }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  const stripHtmlTags = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

<<<<<<< HEAD
  const open = () => navigate(`/blog-details/${id}`);
  const cleanTitle = title ? title.replace(/<\/?[^>]+(>|$)/g, "") : "";
  const summary = stripHtmlTags(description);
  const cleanTags = Array.isArray(tags) ? tags.filter(Boolean) : [];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      style={{ height: "100%" }}
    >
      <GlassCard
        glowOnHover
        onClick={open}
        sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={cleanTitle}
          sx={{
            height: 200,
            objectFit: "cover",
            transition: "transform .5s ease",
            "&:hover": { transform: "scale(1.06)" },
          }}
        />

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {cleanTitle}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {summary.length > 120 ? `${summary.substring(0, 120)}…` : summary}
          </Typography>

          {cleanTags.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {cleanTags.slice(0, 3).map((tag, i) => (
                <Chip key={i} label={tag} size="small" />
              ))}
            </Stack>
          )}

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <UserAvatar
                src={profileImage}
                name={username}
                sx={{ width: 30, height: 30, fontSize: 13 }}
              />
              <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600 }}>
                {username || "Unknown"}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {moment(time).isValid() ? moment(time).format("MMM DD") : ""}
            </Typography>
          </Box>

          <GradientButton
            size="small"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={(e) => { e.stopPropagation(); open(); }}
            sx={{ mt: 0.5 }}
          >
            Read More
          </GradientButton>
        </Box>
      </GlassCard>
=======
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      style={{ margin: "1rem" }}
    >
      <Card
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderRadius: "15px",
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1f1f1f, #292929)"
            : "linear-gradient(135deg, #f9f9f9, #ffffff)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 10px 30px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          "&:hover": {
            boxShadow: theme.palette.mode === "dark"
              ? "0 20px 50px rgba(0, 255, 0, 0.5)"
              : "0 20px 50px rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={() => navigate(`/blog-details/${id}`)}
      >
        {/* Blog Image */}
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{
            height: 250,
            objectFit: "cover",
            borderBottom: `1.5px solid ${theme.palette.mode === "dark" ? "#444" : "#ccc"}`,
            boxShadow: theme.palette.mode === "dark"
            ? "0px 5px 10px rgba(0, 255, 0, 0.5)" 
            : "0px 5px 10px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.5s ease-in-out",
            "&:hover": { transform: "scale(1.1)" },
          }}
        />

        {/* Blog Details */}
        <Box sx={{ padding: 3, background: theme.palette.mode === "dark" ? "#181818" : "#fff" }}>
          {/* Title */}
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ textAlign: "center", mb: 1, color: theme.palette.mode === "dark" ? "#fff" : "#111" }}
          >
            {title.replace(/<\/?[^>]+(>|$)/g, "")} {/* Removes unwanted HTML tags */}
          </Typography>
          
         <Typography sx={{ color: theme.palette.mode === "dark" ? "#ddd" : "#333", textAlign: "center" }}>
  {stripHtmlTags(description).length > 120 ? `${stripHtmlTags(description).substring(0, 120)}...` : stripHtmlTags(description)}
</Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar 
  src={profileImage && profileImage.startsWith("http") ? profileImage : "/default-avatar.png"}
  onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
  sx={{ width: 35, height: 35 }}
/>
              <Typography 
                variant="body2" 
                sx={{ color: theme.palette.mode === "dark" ? "#7FFFD4" : "#007BFF", fontWeight: "bold" }}
              >
                {username || "Unknown"}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "#aaa" : "#555" }}>
  {moment(time).isValid() ? moment(time).format("MMM DD") : "Invalid Date"}
</Typography>

          </Box>

          {tags && tags.length > 0 ? (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mt: 1 }}>
    {tags.map((tag, index) => (
      tag ? (
        <Chip
          key={index}
          label={tag} 
          sx={{
            backgroundColor: theme.palette.mode === "dark" ? "#7FFFD4" : "#007BFF",
            color: "#000",
            fontWeight: "bold",
            fontSize: "12px",
            padding: "5px",
          }}
        />
      ) : null
    ))}
  </Box>
) : (
  <Typography sx={{ textAlign: "center", fontSize: "12px", color: "#999" }}>
    No tags available
  </Typography>
)}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7FFF00",
                color: "#000",
                borderRadius: "20px",
                padding: "5px 15px",
                "&:hover": { backgroundColor: "#7FFF00" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blog-details/${id}`);
              }}
            >
              Read More
            </Button>
          </Box>
        </Box>
      </Card>
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    </motion.div>
  );
};

<<<<<<< HEAD
export default BlogCard;
=======
export default BlogCard;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
