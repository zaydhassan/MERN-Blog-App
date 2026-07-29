import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Tab,
  Tabs,
  TextField,
<<<<<<< HEAD
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Chip,
  InputAdornment,
=======
  AppBar,
  Toolbar,
  Typography,
  Paper,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PublishIcon from "@mui/icons-material/Publish";
import moment from "moment";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import toast from "react-hot-toast";
import GlassCard from "../components/GlassCard";
import SectionHeading from "../components/SectionHeading";

const stripHtml = (html) => {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

const UserBlogs = () => {
=======
import { toast } from "react-toastify";
const stripHtml = (html) => {
  return html.replace(/<\/?[^>]+(>|$)/g, ""); 
};

const UserBlogs = () => {
  const theme = useTheme();
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const handleTabChange = (event, newValue) => {
    setFilter(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const getUserBlogs = async () => {
    try {
<<<<<<< HEAD
      setLoading(true);
      setFetchError(false);
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      const id = localStorage.getItem("userId");
      const { data } = await axios.get(`/api/v1/blog/user-blog/${id}`);
      if (data?.success) {
        setBlogs(data.userBlog.blogs);
      }
    } catch (error) {
<<<<<<< HEAD
      setFetchError(true);
    } finally {
      setLoading(false);
=======
      console.log(error);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
  };

  useEffect(() => {
    getUserBlogs();
<<<<<<< HEAD
  }, [filter]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this blog permanently? This cannot be undone.");
    if (!ok) return;

    try {
      const response = await axios.delete(`/api/v1/blog/delete-blog/${id}`);
      if (response.data.success) {
        toast.success("Blog deleted.");
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
      } else {
        toast.error(response.data.message || "Failed to delete blog.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog.");
    }
  };

  const handlePublish = async (id) => {
    try {
      const { data } = await axios.put(`/api/v1/blog/update-blog/${id}`, { status: "Published" });

      if (data.success) {
        toast.success("Blog published successfully!");
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === id ? { ...blog, status: "Published" } : blog
          )
        );
      } else {
        throw new Error("Failed to publish blog.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish blog.");
    }
  };

  const handleEdit = (blog) => {
    navigate(`/edit-blog/${blog._id}`);
  };
=======
}, [filter, navigate.location]);  

  const handleDelete = async (id) => {
    console.log("Deleting blog with ID:", id); 
  
    try {
      const response = await axios.delete(`/api/v1/blog/delete-blog/${id}`);
      console.log("Delete Response:", response.data);
  
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Error deleting blog:", error.response?.data || error.message);
    }
  };
  
  const handlePublish = async (id) => {
    try {
        const { data } = await axios.put(`/api/v1/blog/update-blog/${id}`, { status: "Published" });
        
        if (data.success) {
            toast.success("Blog published successfully!");
            setBlogs((prevBlogs) =>
                prevBlogs.map((blog) =>
                    blog._id === id ? { ...blog, status: "Published" } : blog
                )
            );
        } else {
            throw new Error("Failed to publish blog.");
        }
    } catch (error) {
        console.log("Error publishing blog:", error);
        toast.error("Failed to publish blog.");
    }
};

const handleEdit = (blog) => {
  navigate(`/edit-blog/${blog._id}`);
};
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.status === (filter === "published" ? "Published" : "Draft") &&
      (blog.title.toLowerCase().includes(searchTerm) ||
        stripHtml(blog.description).toLowerCase().includes(searchTerm))
  );

  return (
<<<<<<< HEAD
    <Box sx={{ flexGrow: 1, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <SectionHeading
        eyebrow="Your workspace"
        title="My Blogs"
        subtitle="Manage your published stories and drafts."
        align="left"
        sx={{ mb: 4 }}
      />

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3, alignItems: { sm: "center" } }}>
        <TextField
          variant="outlined"
          placeholder="Search your blogs"
          size="small"
          sx={{ flex: 1, maxWidth: 480 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          onChange={handleSearchChange}
        />
        <Tabs
          value={filter}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
=======
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        padding: 3
      }}
    >
    
      <AppBar position="static" color="default" elevation={1} sx={{ borderRadius: 1 }}>
        <Toolbar>
          <TextField
            variant="outlined"
            placeholder="Search Blogs"
            size="small"
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
              ml: 2,
              mr: 2,
              fieldset: { border: `1px solid ${theme.palette.divider}` }
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
              )
            }}
            onChange={handleSearchChange}
          />
        </Toolbar>
      </AppBar>

      <Paper elevation={2} sx={{ flexGrow: 1, marginTop: 2, padding: 1, borderRadius: 1 }}>
        <Tabs
          value={filter}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          centered
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        >
          <Tab label="Published" value="published" />
          <Tab label="Drafts" value="draft" />
        </Tabs>
<<<<<<< HEAD
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 3,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 6, gridColumn: "1 / -1" }}>
            <CircularProgress />
          </Box>
        ) : fetchError ? (
          <Box sx={{ textAlign: "center", padding: 6, gridColumn: "1 / -1" }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Couldn't load your blogs.
            </Typography>
            <Button variant="outlined" color="primary" onClick={getUserBlogs}>
              Retry
            </Button>
          </Box>
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard
                glowOnHover
                onClick={(e) => {
                  if (!e.defaultPrevented) {
                    navigate(`/blog-details/${blog._id}`);
                  }
                }}
                sx={{ cursor: "pointer", display: "flex", flexDirection: "column", height: "100%" }}
              >
                <Box
                  component="img"
                  src={blog.image || "/tech1.jpeg"}
                  alt={blog.title}
                  sx={{ width: "100%", height: 180, objectFit: "cover" }}
                />
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Chip
                      size="small"
                      label={blog.status === "Published" ? "Published" : "Draft"}
                      color={blog.status === "Published" ? "primary" : "default"}
                      variant={blog.status === "Published" ? "filled" : "outlined"}
                    />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {moment(blog.created_at).format("MMM Do, YYYY")}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "Plus Jakarta Sans, Inter, sans-serif", mb: 1 }}>
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, flexGrow: 1 }}>
                    {stripHtml(blog.description).length > 120
                      ? `${stripHtml(blog.description).substring(0, 120)}...`
                      : stripHtml(blog.description)}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: `1px solid`, borderColor: "divider" }}>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blog-details/${blog._id}`);
=======

        <Box
          sx={{
            p: 3,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3
          }}
        >
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
  onClick={(e) => {
    if (!e.defaultPrevented) { 
      navigate(`/blog-details/${blog._id}`);
    }
  }}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: theme.shadows[3],
                    backgroundColor: theme.palette.background.paper,
                    border: "2px solid transparent",
                    transition: "0.3s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[10],
                      transform: "scale(1.02)",
                      borderImage: "linear-gradient(45deg, #FF6B6B, #FFD93D) 1"
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={blog.image || "https://via.placeholder.com/180"}
                    alt={blog.title}
                  />
                  <CardContent sx={{ padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                      {stripHtml(blog.description).length > 120
                        ? `${stripHtml(blog.description).substring(0, 120)}...`
                        : stripHtml(blog.description)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {moment(blog.created_at).format("MMMM Do YYYY")}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ padding: 2, display: "flex", justifyContent: "space-between" }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigate(`/blog-details/${blog._id}`);
                    }}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        background: "linear-gradient(to right, #FF6B6B, #FFD93D)",
                        "&:hover": {
                          background: "linear-gradient(to right, #FFD93D, #FF6B6B)"
                        }
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
                      }}
                    >
                      Read More
                    </Button>
<<<<<<< HEAD
                    <Box>
                      {blog.status === "Published" ? (
                        <IconButton
                          color="error"
                          size="small"
                          aria-label="Delete blog"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(blog._id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <>
                          <IconButton
                            color="primary"
                            size="small"
                            aria-label="Edit blog"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(blog);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<PublishIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublish(blog._id);
                            }}
                          >
                            Publish
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <Box sx={{ textAlign: "center", padding: 6, gridColumn: "1 / -1" }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {filter === "draft" ? "No drafts yet." : "No published blogs yet."}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate("/create-blog")}>
              Create your first blog
            </Button>
          </Box>
        )}
      </Box>
=======

                    <Box>
    {blog.status === "Published" ? (
      <IconButton
      color="error"
      onClick={(e) => {
        e.stopPropagation(); 
        handleDelete(blog._id);
      }}
    >
      <DeleteIcon />
    </IconButton>
    
    ) : (
      <>
       <IconButton
  color="primary"
  onClick={(e) => {
    e.stopPropagation();  
    handleEdit(blog);
  }}
>
  <EditIcon />
</IconButton>

        <Button size="small" variant="contained" color="success" startIcon={<PublishIcon />} onClick={() => handlePublish(blog._id)}>
          Publish
        </Button>
      </>
    )}
  </Box>
</CardActions>
                </Card>
              </motion.div>
            ))
          ) : (
            <Typography textAlign="center" color="textSecondary">
              No blogs found
            </Typography>
          )}
        </Box>
      </Paper>
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    </Box>
  );
};

<<<<<<< HEAD
export default UserBlogs;
=======
export default UserBlogs;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
