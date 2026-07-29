import React from "react";
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

  const stripHtmlTags = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

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
    </motion.div>
  );
};

export default BlogCard;