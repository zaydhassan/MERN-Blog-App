import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { Box, Typography, CircularProgress } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import HistoryIcon from "@mui/icons-material/History";
import BlogCard from "./BlogCard";
import BlogGrid from "./BlogGrid";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import SectionHeading from "./SectionHeading";

const PAGE_SIZE = 9;

const EMPTY_ICON = { bookmarks: BookmarkBorderIcon, history: HistoryIcon };

// Shared list UI for the Bookmarks and Reading History pages: fetches a
// paginated list of the user's saved/read blogs from `endpoint` and renders
// them in the same BlogGrid/BlogCard surface used everywhere else. `kind`
// ("bookmarks" | "history") only toggles the empty-state icon + copy.
const SavedBlogsView = ({ endpoint, kind, eyebrow, title, subtitle, emptyTitle, emptyBody }) => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchPage = useCallback(async (p, append) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const { data } = await axios.get(`${endpoint}?page=${p}&limit=${PAGE_SIZE}`);
      const formatted = (data.blogs || []).map((blog) => ({
        ...blog,
        userAvatar: blog.user?.profile_image,
        tags: Array.isArray(blog.tags)
          ? blog.tags.map((t) => t?.tag_name?.trim()).filter((t) => t && t.length > 0)
          : [],
      }));
      setBlogs((prev) => (append ? [...prev, ...formatted] : formatted));
      setHasMore(Boolean(data.hasMore));
      setPage(p);
      setFetchError(false);
    } catch {
      if (!append) {
        setBlogs([]);
        setFetchError(true);
      }
      setHasMore(false);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const EmptyIcon = EMPTY_ICON[kind] || BookmarkBorderIcon;

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} badge align="left" sx={{ mb: 4 }} />
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        {fetchError ? (
          <Box textAlign="center" mt={5}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Couldn’t load this list. Please try again.</Typography>
            <GradientButton onClick={() => fetchPage(1, false)}>Retry</GradientButton>
          </Box>
        ) : blogs.length === 0 ? (
          <GlassCard sx={{ p: 6, textAlign: "center" }}>
            <EmptyIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>{emptyTitle}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{emptyBody}</Typography>
          </GlassCard>
        ) : (
          <>
            <BlogGrid>
              {blogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  id={blog._id}
                  title={blog.title}
                  description={blog.description}
                  image={blog.image}
                  username={blog.user?.username || "Unknown"}
                  time={moment(blog.created_at).format("MMM DD, YYYY")}
                  profileImage={blog.userAvatar}
                  tags={blog.tags}
                />
              ))}
            </BlogGrid>

            {hasMore && (
              <Box display="flex" justifyContent="center" mt={5}>
                <GradientButton onClick={() => fetchPage(page + 1, true)} disabled={loadingMore}>
                  {loadingMore ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Load More"}
                </GradientButton>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SavedBlogsView;