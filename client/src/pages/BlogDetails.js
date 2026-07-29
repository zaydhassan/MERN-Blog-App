import React, { useState, useEffect } from "react";
import axios from "axios";
import {
<<<<<<< HEAD
  Box, Typography, IconButton, Badge, Drawer, TextField, Button,
  Divider, CardMedia, Menu, MenuItem, Container, Stack, Chip, CircularProgress
} from "@mui/material";
import { Favorite, FavoriteBorder, Share, Comment, Edit, Delete, Report } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sanitizeHtml } from "../utils/sanitize";
import { onActivate } from "../utils/a11y";
import moment from "moment";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import UserAvatar from "../components/UserAvatar";
import SectionHeading from "../components/SectionHeading";
import "./BlogDetails.css";
=======
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Drawer,
  TextField,
  Button,
  Divider,
  CardMedia,
  Menu,
  MenuItem
} from "@mui/material";
import { Favorite, FavoriteBorder, Share, Comment, Edit, Delete,Report } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import { useTheme } from '@mui/material/styles';
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

const BlogDetails = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
<<<<<<< HEAD
  const [recsError, setRecsError] = useState(false);
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  const [editingComment, setEditingComment] = useState({ id: null, text: "" });
  const [replyText, setReplyText] = useState({});
  const [reportedComments, setReportedComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
<<<<<<< HEAD
  // Comments are paginated server-side (the endpoint accepts ?page=&limit=).
  // We fetch one page at a time; "Load more" requests the next page and
  // appends. commentCount is the server total so the badge is correct even
  // before every page is loaded.
  const COMMENTS_PER_PAGE = 5;
  const [commentPage, setCommentPage] = useState(1);
  const [commentHasMore, setCommentHasMore] = useState(false);

  const fetchCommentsPage = async (page, append) => {
    try {
      const { data } = await axios.get(`/api/v1/comments/${id}?page=${page}&limit=${COMMENTS_PER_PAGE}`);
      if (data.success) {
        setComments((prev) => (append ? [...prev, ...data.comments] : data.comments));
        setCommentCount(data.commentCount ?? data.comments.length);
        setCommentPage(page);
        setCommentHasMore(Boolean(data.hasMore));
      }
    } catch (error) {
      toast.error("Couldn't load comments.");
    }
  };

  // Re-fetch every page the user has currently loaded so the local list stays
  // in sync with the server (e.g. after posting a new comment).
  const reloadLoadedComments = async () => {
    const all = [];
    let meta = null;
    for (let p = 1; p <= commentPage; p++) {
      const { data } = await axios.get(`/api/v1/comments/${id}?page=${p}&limit=${COMMENTS_PER_PAGE}`);
      if (data.success) { all.push(...data.comments); meta = data; }
    }
    setComments(all);
    if (meta) {
      setCommentCount(meta.commentCount ?? all.length);
      setCommentHasMore(Boolean(meta.hasMore));
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/blog/get-blog/${id}`, {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0" },
        });
        const likeResponse = await axios.get(`/api/v1/likes/${id}`);

=======
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  useEffect(() => {

    const fetchBlogDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/blog/get-blog/${id}`, { 
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
    
        const likeResponse = await axios.get(`/api/v1/likes/${id}`);
        const commentResponse = await axios.get(`/api/v1/comments/${id}`,{
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        if (response.data.success) {
          setBlog(response.data.blog);
        } else {
          toast.error("Failed to fetch blog details.");
        }
<<<<<<< HEAD

        if (likeResponse.data.success) {
          const likes = likeResponse.data.likes;
          setLikeCount(likes.length);
=======
    
        if (likeResponse.data.success) {
          const likes = likeResponse.data.likes;
          setLikeCount(likes.length);
    
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
          let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
          const userLiked = likes.some((like) => like.user_id === currentUser._id);
          setLiked(userLiked);
        } else {
          setLikeCount(0);
          setLiked(false);
        }
<<<<<<< HEAD
      } catch (error) {
        toast.error("Failed to fetch blog details.");
      } finally {
        // Loading is tied to the actual fetch, not an artificial timer.
        setLoading(false);
      }
    };

    // Comments are fetched in their own paginated request (page 1).
    fetchCommentsPage(1, false);

    const fetchRecommendations = async () => {
      try {
        // Fetch only a small page instead of the entire blog catalog. We grab
        // a couple extra so we can drop the current blog and still fill 5.
        const { data } = await axios.get("/api/v1/blog/all-blog?page=1&limit=8");
        if (data.success) {
          setRecommendations(data.blogs.filter((b) => b._id !== id).slice(0, 5));
          setRecsError(false);
        }
      } catch (error) {
        setRecsError(true);
=======
    
        if (commentResponse.data.success) {
          setComments([...commentResponse.data.comments]); 
          setCommentCount(commentResponse.data.commentCount);
        } else {
          setComments([]);
          setCommentCount(0);
        }
      } catch (error) {
        console.error("Error fetching blog details:", error);
        toast.error("Failed to fetch blog details.");
      }
    };

    const fetchRecommendations = async () => {
      try {
        const { data } = await axios.get("/api/v1/blog/all-blog");
        if (data.success) {
          setRecommendations(data.blogs.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      }
    };

    fetchBlogDetails();
    fetchRecommendations();
  }, [id, user]);

  const handleLike = async () => {
    try {
      let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
<<<<<<< HEAD
      if (!currentUser || !currentUser._id) { toast.error("User not logged in."); return; }

      const { data } = await axios.post(`/api/v1/likes/toggle`, { blog_id: id });
      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        // Points are awarded atomically server-side inside the toggle endpoint,
        // so there is no separate (farmable) point call here.
        toast(data.liked ? "+5 Points! Liked the blog." : "-5 Points! Unliked the blog.", { icon: data.liked ? "👍" : "👎" });
      }
      const likeResponse = await axios.get(`/api/v1/likes/${id}`);
      if (likeResponse.data.success) {
        const likes = likeResponse.data.likes;
        setLikeCount(likes.length);
        const userLiked = likes.some((like) => like.user_id === currentUser._id);
        setLiked(userLiked);
      }
    } catch (error) {
      toast.error("Error updating like");
    }
  };

  const handleShareClick = (event) => setAnchorEl(event.currentTarget);
  const handleShareClose = () => setAnchorEl(null);

  const handleShare = (platform) => {
    if (!blog) return;
    const shareUrl = `${window.location.origin}/blog-details/${id}`;
    const title = encodeURIComponent(blog.title);
    let url = "";
    switch (platform) {
      case "twitter": url = `https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`; break;
      case "facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; break;
      case "linkedin": url = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${title}`; break;
      case "whatsapp": url = `https://wa.me/?text=${title} - ${shareUrl}`; break;
      default: return;
=======
  
      if (!currentUser || !currentUser._id) {
        toast.error("User not logged in.");
        return;
      }
  
      const { data } = await axios.post(
        `/api/v1/likes/toggle`,
        { blog_id: id, user_id: currentUser._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (data.success) {
        setLiked(data.liked); 
        setLikeCount(data.likeCount); 

        await axios.post("/api/v1/user/update-like-points", { 
          userId: currentUser._id, 
          liked: data.liked
        });
  
        toast(
          data.liked 
            ? "+5 Points! Liked the blog." 
            : "-5 Points! Unliked the blog.",
          { icon: data.liked ? "👍" : "👎" }
        );
      }
        const likeResponse = await axios.get(`/api/v1/likes/${id}`);
        if (likeResponse.data.success) {
          const likes = likeResponse.data.likes;
          setLikeCount(likes.length);
  
          const userLiked = likes.some((like) => like.user_id === currentUser._id);
          setLiked(userLiked);
        }
      
    } catch (error) {
      console.error("Error in handleLike:", error.response || error);
      toast.error("Error updating like");
    }
  };  
  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };
  
  const handleShare = (platform) => {
    if (!blog) return;

    const shareUrl = `${window.location.origin}/blog-details/${id}`;
    const title = encodeURIComponent(blog.title);

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${title}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${title} - ${shareUrl}`;
        break;
      default:
        return;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
    window.open(url, "_blank");
    handleShareClose();
  };

  const handleComment = async () => {
<<<<<<< HEAD
    if (!newComment.trim()) { toast.error("Please write a comment before posting."); return; }
    let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser || !currentUser._id || !currentUser.role) { toast.error("User data not available."); return; }
    if (!["Reader", "Writer"].includes(currentUser.role)) { toast.error("Only Readers and Writers can leave comments."); return; }
    try {
      const response = await axios.post(`/api/v1/comments`, {
        content: newComment.trim(), blog_id: id, user_id: currentUser._id, role: currentUser.role
      });
      if (response.status === 201) {
        toast.success("Comment added!");
        setNewComment("");
        // Re-sync the loaded pages with the server. Under oldest-first ordering
        // the new comment lives on a later page, so it appears once the user
        // loads more — consistent with the existing threading.
        await reloadLoadedComments();
=======
    if (!newComment.trim()) {
      toast.error("Please write a comment before posting.");
      return;
    }
  
    let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  
    if (!currentUser || !currentUser._id || !currentUser.role) {
      toast.error("User data not available.");
      return;
    }
  
    if (!["Reader", "Writer"].includes(currentUser.role)) {
      toast.error("Only Readers and Writers can leave comments.");
      return;
    }
  
    try {
      const response = await axios.post(`/api/v1/comments`, {
        content: newComment.trim(),
        blog_id: id,
        user_id: currentUser._id,
        role: currentUser.role
      });
  
      if (response.status === 201) {
        toast.success("Comment added!");
        setNewComment("");

        const commentResponse = await axios.get(`/api/v1/comments/${id}`);
        if (commentResponse.data.success) {
          setComments((prevComments) => [...commentResponse.data.comments]); 
          setCommentCount(commentResponse.data.commentCount);
        }
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding comment");
    }
  };
<<<<<<< HEAD

  const toggleComments = () => setCommentsOpen((prev) => !prev);

  const handleEdit = (commentId) => {
    const commentToEdit = comments.find((c) => c._id === commentId);
    if (commentToEdit) setEditingComment({ id: commentToEdit._id, text: commentToEdit.content });
  };

  const handleEditSave = async (commentId, updatedText) => {
    if (!updatedText.trim()) { toast.error("Comment cannot be empty."); return; }
    try {
      const response = await axios.put(`/api/v1/comments/${commentId}`, { content: updatedText });
      if (response.status === 200) {
        setComments(comments.map((c) => (c._id === commentId ? { ...c, content: updatedText } : c)));
        toast.success("Comment updated successfully!");
        setEditingComment({ id: null, text: "" });
      }
    } catch (error) {
      toast.error("Failed to update comment.");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/v1/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
=======
  
  const toggleComments = () => {
    setCommentsOpen((prev) => !prev);
  };

  const handleEdit = (commentId) => {
    const commentToEdit = comments.find(comment => comment._id === commentId);
    if (commentToEdit) {
      setEditingComment({ id: commentToEdit._id, text: commentToEdit.content }); // Ensure correct property
    }
  };
  
  const handleEditSave = async (commentId, updatedText) => {
    if (!updatedText.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
  
    try {
      const response = await axios.put(`/api/v1/comments/${commentId}`, { content: updatedText });
  
      if (response.status === 200) {
        setComments(comments.map(comment =>
          comment._id === commentId ? { ...comment, content: updatedText } : comment
        ));
        toast.success("Comment updated successfully!");
        setEditingComment({ id: null, text: "" }); 
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment.");
    }
  };
  
  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/v1/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete comment.");
    }
  };
<<<<<<< HEAD

  const handleReport = async (commentId, commentUserId) => {
    if (!commentId || user?._id === commentUserId) { toast.error("You cannot report your own comment."); return; }
=======
  
  const handleReport = async (commentId, commentUserId) => {
    if (!commentId || user?._id === commentUserId) {
      toast.error("You cannot report your own comment.");
      return;
    }

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    try {
      await axios.post(`/api/v1/comments/report`, { commentId, userId: user._id });
      setReportedComments([...reportedComments, commentId]);
      toast.success("Comment reported successfully!");
    } catch (error) {
      toast.error("Error reporting comment.");
    }
  };

  const handleReply = async (commentId, replyContent) => {
    if (!replyContent.trim()) return toast.error("Reply cannot be empty.");
<<<<<<< HEAD
    try {
      let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
      if (!currentUser || !currentUser._id) { toast.error("User not logged in."); return; }
      const { data } = await axios.post(`/api/v1/comments/reply`, {
        parentId: commentId, content: replyContent.trim(), user_id: currentUser._id,
      });
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, replies: [...(c.replies || []), data.reply] } : c)));
      toast.success("Reply added successfully!");
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      toast.error("Failed to add reply.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Cover */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 260, md: 420 },
          backgroundImage: `url(${blog?.image || "/tech1.jpeg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 4,
          mb: 3,
          boxShadow: (t) => t.customShadows?.card,
        }}
      />

      <GlassCard sx={{ p: { xs: 3, md: 5 } }}>
        {/* Meta row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <UserAvatar src={blog?.user?.profile_image} name={blog?.user?.username} sx={{ border: (t) => `2px solid ${t.palette.primary.main}` }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{blog?.user?.username || "Unknown Author"}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{moment(blog?.created_at).format("MMMM DD, YYYY")}</Typography>
            </Box>
          </Stack>
          {blog?.category && <Chip label={blog.category} color="primary" variant="filled" />}
        </Stack>

        <Typography variant="h3" sx={{ mb: 3 }}>{blog?.title}</Typography>

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <IconButton onClick={handleLike} aria-label={liked ? "Unlike" : "Like"}>
            <Badge badgeContent={likeCount} color="primary">{liked ? <Favorite color="error" /> : <FavoriteBorder />}</Badge>
          </IconButton>
          <IconButton onClick={toggleComments} aria-label="Comments">
            <Badge badgeContent={commentCount} color="primary"><Comment /></Badge>
          </IconButton>
          <IconButton onClick={handleShareClick} aria-label="Share"><Share /></IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleShareClose}>
            <MenuItem onClick={() => handleShare("twitter")}>Share on Twitter</MenuItem>
            <MenuItem onClick={() => handleShare("facebook")}>Share on Facebook</MenuItem>
            <MenuItem onClick={() => handleShare("linkedin")}>Share on LinkedIn</MenuItem>
            <MenuItem onClick={() => handleShare("whatsapp")}>Share on WhatsApp</MenuItem>
          </Menu>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Article body — scoped prose styles in BlogDetails.css */}
        <Box
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog?.description) }}
        />
      </GlassCard>

      {/* Recommendations */}
      {(recommendations.length > 0 || recsError) && (
        <Box sx={{ mt: 6 }}>
          <SectionHeading eyebrow="Keep reading" title="Recommended for you" badge />
          {recsError ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Couldn’t load recommendations.</Typography>
          ) : (
            <GlassCard sx={{ p: 2, mt: 2 }}>
              {recommendations.map((rec, index) => (
                <Box
                  key={rec._id}
                  role="button"
                  tabIndex={0}
                  sx={{
                    display: "flex", alignItems: "center", mb: 1.5, p: 1, borderRadius: 2, cursor: "pointer",
                    transition: "background-color .2s ease", "&:hover": { backgroundColor: "action.hover" },
                  }}
                  onClick={() => navigate(`/blog-details/${rec._id}`)}
                  onKeyDown={onActivate(() => navigate(`/blog-details/${rec._id}`))}
                >
                  <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 800, mr: 2, minWidth: 34 }}>0{index + 1}</Typography>
                  <UserAvatar src={rec.user?.profile_image} name={rec.user?.username} sx={{ width: 40, height: 40, mr: 2 }} />
                  <Box flexGrow={1} sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.title}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{rec.user?.username ?? "Unknown"} · {moment(rec.created_at).format("MMM DD")}</Typography>
                  </Box>
                  <CardMedia component="img" sx={{ width: 90, height: 56, borderRadius: 2, ml: 2 }} image={rec.image} alt={rec.title} />
                </Box>
              ))}
            </GlassCard>
          )}
        </Box>
      )}

      {/* Comments drawer */}
      <Drawer anchor="right" open={commentsOpen} onClose={toggleComments} PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", flex: 1 }}>
            {comments.length > 0 ? (
              <>
                {comments.map((comment, index) => (
                  <GlassCard key={index} sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <UserAvatar src={comment?.user_id?.profile_image} name={comment?.user_id?.username} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{comment?.user_id?.username || "Unknown User"}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{comment?.date || moment().format("MMM DD, YYYY")}</Typography>
                        </Box>
                      </Stack>
                      <Box>
                        {user && comment?.user_id?._id && String(user?._id) === String(comment?.user_id?._id) ? (
                          <>
                            <IconButton onClick={() => handleEdit(comment._id)} aria-label="Edit comment" size="small"><Edit fontSize="small" /></IconButton>
                            <IconButton onClick={() => handleDelete(comment._id)} aria-label="Delete comment" size="small"><Delete fontSize="small" color="error" /></IconButton>
                          </>
                        ) : (
                          <IconButton onClick={() => handleReport(comment._id, comment.user_id._id)} disabled={reportedComments.includes(comment._id)} aria-label="Report comment" size="small">
                            <Report fontSize="small" color={reportedComments.includes(comment._id) ? "disabled" : "action"} />
                          </IconButton>
                        )}
                      </Box>
                    </Stack>

                    {editingComment?.id === comment._id ? (
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5 }}>
                        <TextField fullWidth size="small" value={editingComment.text}
                          onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))} />
                        <Button variant="contained" size="small" onClick={() => handleEditSave(comment._id, editingComment.text)}>Save</Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1, color: "text.primary" }}>{comment.content || comment.text || "No content available"}</Typography>
                    )}

                    {comment.replies?.map((reply, idx) => (
                      <Box key={idx} sx={{ ml: 4, mt: 1.5, p: 1.5, borderRadius: 2, backgroundColor: "action.hover" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{reply?.user?.username || "Anonymous"}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{reply?.content || "No content available"}</Typography>
                      </Box>
                    ))}

                    {user && comment.user_id && String(user._id) !== String(comment.user_id._id) && (
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5 }}>
                        <TextField fullWidth size="small" placeholder="Write a reply…" value={replyText[comment._id] || ""}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))} />
                        <Button variant="outlined" size="small" onClick={() => handleReply(comment._id, replyText[comment._id])}>Reply</Button>
                      </Stack>
                    )}
                  </GlassCard>
                ))}
                {commentHasMore && (
                  <Button fullWidth variant="text" onClick={() => fetchCommentsPage(commentPage + 1, true)}>Load more comments</Button>
                )}
              </>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No comments yet. Be the first to comment.</Typography>
            )}
          </Box>

          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 2 }}>
            <TextField fullWidth label="Leave a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <GradientButton onClick={handleComment} sx={{ height: 56, px: 3 }}>Post</GradientButton>
          </Stack>
        </Box>
      </Drawer>
    </Container>
  );
};

export default BlogDetails;
=======
  
    try {
      let currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  
      if (!currentUser || !currentUser._id) {
        toast.error("User not logged in.");
        return;
      }
  
      const { data } = await axios.post(`/api/v1/comments/reply`, {
        parentId: commentId,
        content: replyContent.trim(),
        user_id: currentUser._id,
      });
  
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, replies: [...c.replies, data.reply] } : c
        )
      );
  
      toast.success("Reply added successfully!");
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply.");
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);  
    }, 3000);
    return () => clearTimeout(timer); 
  }, []);
  
  if (loading) {

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ backgroundColor: "#121212" }}
      >
        <Box className="glowing-gradient-spinner"></Box>
        <style>
          {`
            .glowing-gradient-spinner {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              border: 6px solid transparent;
              border-top: 6px solid #ff00ff;
              border-left: 6px solid #00c6ff;
              animation: spin 1.2s linear infinite, glow 1.5s ease-in-out infinite alternate;
            }
  
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
  
            @keyframes glow {
              0% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff; }
              100% { box-shadow: 0 0 10px #00c6ff, 0 0 20px #00c6ff, 0 0 40px #00c6ff; }
            }
          `}
        </style>
      </Box>
    );
  }
  
  return (
    <Box padding={4}>
      <Box
        sx={{
          width: "100%",
          height: "400px",
          backgroundImage: `url(${blog?.image || "https://source.unsplash.com/800x400/?blog"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        }}
      />

<Box display="flex" alignItems="center" gap={2} marginBottom={2}>
<Avatar src={blog?.user?.profile_image ?? "/default-avatar.png"} />

        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            
            {blog?.user?.username || "Unknown Author"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {moment(blog?.created_at).format("MMMM DD, YYYY")}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={2}>
  <IconButton onClick={handleLike}>
    <Badge badgeContent={likeCount} color="primary">
      {liked ? <Favorite color="error" /> : <FavoriteBorder />}
    </Badge>
  </IconButton>

           <IconButton onClick={toggleComments}>
    <Badge badgeContent={commentCount} color="primary">
      <Comment />
    </Badge>
  </IconButton>
          <IconButton onClick={handleShareClick}>
            <Share />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleShareClose}>
          <MenuItem onClick={() => handleShare("twitter")}>Share on Twitter</MenuItem>
          <MenuItem onClick={() => handleShare("facebook")}>Share on Facebook</MenuItem>
          <MenuItem onClick={() => handleShare("linkedin")}>Share on LinkedIn</MenuItem>
          <MenuItem onClick={() => handleShare("whatsapp")}>Share on WhatsApp</MenuItem>
        </Menu>
        </Box>
        <Typography variant="h4" fontWeight="bold" marginTop={3}>
        {blog?.title}
      </Typography>
      <Box
        dangerouslySetInnerHTML={{ __html: blog?.description }}
        sx={{ marginTop: 2, color: "gray" }}
      />

      <Typography variant="h5" fontWeight="bold" marginTop={5} marginBottom={3}>
        Recommended for You ↝
      </Typography>

      {recommendations.map((rec, index) => (
        <Box
          key={rec._id}
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 3,
            cursor: "pointer",
            color: "#fff",
          }}
          onClick={() => navigate(`/blog-details/${rec._id}`)}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ marginRight: 2 }}>
            0{index + 1}
          </Typography>
          <Avatar
  src={rec.user?.profile_image ?? "/default-avatar.png"}
  sx={{ width: 40, height: 40, marginRight: 2 }}
  alt={rec.user?.username ?? "Unknown"}
/>
          <Box flexGrow={1}>
            <Typography variant="subtitle1" fontWeight="bold"
             sx={{ color: theme.palette.mode === 'dark' ? "#fff" : "#000" }}
>
              {rec.title}
            </Typography>
            <Typography variant="caption" display="block"
             sx={{ color: theme.palette.mode === 'dark' ? "#bbb" : "#333" }}
>
  {rec.user?.username ?? "Unknown"}
</Typography>

            <Typography variant="caption" color="gray">
              {moment(rec.created_at).format("MMM DD")}
            </Typography>
            
          </Box>
          <CardMedia
            component="img"
            sx={{ width: 100, height: 60, borderRadius: "10px" }}
            image={rec.image}
            alt={rec.title}
          />
        </Box>
      ))}

      <Drawer anchor="right" open={commentsOpen} onClose={toggleComments} sx={{ width: 400 }}>
        <Box
          width={400}
          padding={2}
          display="flex"
          flexDirection="column"
          sx={{
            background: theme.palette.mode === 'dark' 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(0, 0, 0, 0.05)", 
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: theme.palette.mode === 'dark' 
            ? "0px 4px 30px rgba(0, 0, 0, 0.5)" 
            : "0px 4px 15px rgba(0, 0, 0, 0.1)",
          color: theme.palette.mode === 'dark' ? "white" : "black",
          padding: "16px"
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            marginBottom: 2, 
            color: theme.palette.mode === 'dark' ? "white" : "#333" 
          }}
        >
          Comments
        </Typography>
        <Divider 
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' 
              ? "rgba(255, 255, 255, 0.3)" 
              : "rgba(0, 0, 0, 0.2)", 
            marginY: 2 
          }} 
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
            maxHeight: "60vh",
          }}
        >
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <Box
                key={index}
                padding={2}
                sx={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                  color: "white",
                }}
              >
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={comment?.user_id?.profile_image || "/default-avatar.png"}>
  {comment?.user_id?.profile_image ? "" : comment?.user_id?.username?.charAt(0) || "U"}
</Avatar>
                    <Box>
                    <Typography variant="subtitle2" fontWeight="bold"
  sx={{ color: theme.palette.mode === 'dark' ? "#fff" : "#333" }}
>
{comment?.user_id?.username || "Unknown User"}
</Typography>
<Typography 
  variant="caption" 
  sx={{ color: theme.palette.mode === 'dark' ? "#bbb" : "#555" }}
>
  {comment?.date || moment().format("MMM DD, YYYY")}
</Typography>
                      </Box>
                    </Box>

                    <Box>
                    {user && comment?.user_id?._id && String(user?._id) === String(comment?.user_id?._id) ? (
    <>
      <IconButton onClick={() => handleEdit(comment._id)}>
        <Edit fontSize="small" sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#555" }} />
      </IconButton>
      <IconButton onClick={() => handleDelete(comment._id)}>
        <Delete fontSize="small" sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#555" }} />
      </IconButton>
    </>
      ) : (
<IconButton
      onClick={() => handleReport(comment._id, comment.user_id._id)}
      disabled={reportedComments.includes(comment._id)}
    >
      <Report fontSize="small" sx={{ color: reportedComments.includes(comment._id) ? "gray" : theme.palette.mode === "dark" ? "#fff" : "#555" }} />
    </IconButton>
      )}
    </Box>
  </Box>
                  {editingComment?.id === comment._id ? (
  <Box display="flex" alignItems="center" gap={1} marginTop={1}>
    <TextField
      fullWidth
      value={editingComment.text}
      onChange={(e) =>
        setEditingComment((prev) => ({ ...prev, text: e.target.value }))
      }
      size="small"
      sx={{
        input: { 
          color: theme.palette.mode === 'dark' ? "white" : "#333" 
        },
        "& .MuiOutlinedInput-root": {
          background: theme.palette.mode === 'dark' 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          "& fieldset": {
            borderColor: theme.palette.mode === 'dark' ? "white" : "#ccc",
          },
        },
      }}
    />
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleEditSave(comment._id, editingComment.text)}
    >
      Save
    </Button>
  </Box>
) : (
  
  <Typography 
  variant="body2"
  sx={{ color: theme.palette.mode === 'dark' ? "#ddd" : "#333" }}
>
  {comment.content || comment.text || "No content available"}
</Typography>

)}
                  {comment.replies?.map((reply, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        marginLeft: 3,
                        background: theme.palette.mode === "dark" 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(0, 0, 0, 0.05)",
                        padding: 1,
                        borderRadius: "8px",
                      }}
                    >
                     <Typography variant="subtitle2" fontWeight="bold"
                     sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#333" }}
                     >
                 {reply?.user?.username || "Anonymous"}
              </Typography>
            <Typography variant="body2"
             sx={{ color: theme.palette.mode === "dark" ? "#ddd" : "#333" }}
             >
             {reply?.content || "No content available"}
                 </Typography>
                    </Box>
                  ))}

{user && comment.user_id && String(user._id) !== String(comment.user_id._id) && (
  <Box display="flex" alignItems="center" gap={1} marginTop={1}>
    <TextField
      fullWidth
      size="small"
      placeholder="Write a reply..."
      value={replyText[comment._id] || ""}
      onChange={(e) =>
        setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))
      }
    />
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleReply(comment._id, replyText[comment._id])}
    >
      Reply
    </Button>
  </Box>
)}
                </Box>
              ))
            ) : (
              <Typography>No comments yet.</Typography>
            )}
          </Box>

          <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    marginTop: 3,
    padding: "12px",
    borderRadius: "12px",
    background: theme.palette.mode === 'dark' 
      ? "rgba(255, 255, 255, 0.1)" 
      : "rgba(0, 0, 0, 0.05)",
    boxShadow: theme.palette.mode === 'dark' 
      ? "0px 2px 10px rgba(0, 0, 0, 0.5)" 
      : "0px 2px 10px rgba(0, 0, 0, 0.1)",
  }}
>

            <TextField
  fullWidth
  label="Leave a comment"
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  variant="outlined"
  sx={{
    input: {
      color: theme.palette.mode === 'dark' ? "white" : "#333",
    },
    "& .MuiOutlinedInput-root": {
      background: theme.palette.mode === 'dark' 
        ? "rgba(255, 255, 255, 0.1)" 
        : "rgba(0, 0, 0, 0.05)",
      borderRadius: "10px",
      "& fieldset": {
        borderColor: theme.palette.mode === 'dark' ? "white" : "#ccc",
      },
    },
  }}
/>

            <Button
              variant="contained"
              color="primary"
              sx={{ padding: "0 15px", height: "56px" }}
              onClick={handleComment}
            >
              Post
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BlogDetails;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
