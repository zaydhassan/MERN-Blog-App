<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Box, Button, InputLabel, TextField, Typography, Select, MenuItem, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import "quill/dist/quill.snow.css";
import "../styles/quill-terracotta.css";
import Quill from "quill";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import SectionHeading from "../components/SectionHeading";

const categories = ["Technology", "Education", "Health", "Entertainment", "Food", "Business", "Social Media", "Travel", "News"];

const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ title: "", description: "", category: "", image: "", tags: [] });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const quillRef = useRef(null);
    const quillInstance = useRef(null);

    // Initialize the Quill editor once. Keep its HTML output in sync with
    // inputs.description so the existing rich-text formatting is preserved
    // (the old code stripped all HTML into a plain TextField, destroying it).
    useEffect(() => {
        if (!quillInstance.current && quillRef.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: "snow",
                placeholder: "Edit your blog...",
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        ["blockquote", "code-block"],
                        [{ header: 1 }, { header: 2 }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ size: ["small", false, "large", "huge"] }],
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        ["clean"],
                    ],
                },
            });

            quillInstance.current.on("text-change", () => {
                setInputs((prev) => ({ ...prev, description: quillInstance.current.root.innerHTML }));
            });
        }
    }, []);

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await axios.get(`/api/v1/blog/get-blog/${id}`);
                if (response.data.success) {
                    const { title, description, category, image, tags } = response.data.blog;
                    const tagNames = (tags || []).map((tag) => (tag.tag_name ? tag.tag_name : tag));
                    setInputs({ title, description: description || "", category, image, tags: tagNames });
                    // Load the existing HTML into Quill — no stripping.
                    if (quillInstance.current) {
                        quillInstance.current.root.innerHTML = description || "";
                    }
                } else {
                    toast.error("Failed to load blog details");
                    navigate("/my-blogs");
                }
            } catch (error) {
                toast.error("Error fetching blog details");
            } finally {
                setLoading(false);
            }
        };
        fetchBlogDetails();
    }, [id, navigate]);

    const handleChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setUploadedImage(file);
    };

    const handleUpdate = async () => {
        if (!inputs.title || !inputs.description || !inputs.category) {
            toast.error("Title, description and category are required.");
            return;
        }

        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("category", inputs.category);
        formData.append("tags", JSON.stringify(inputs.tags));

        if (uploadedImage) {
            formData.append("image", uploadedImage);
        } else if (inputs.image) {
            formData.append("image", inputs.image);
        }

        setIsUpdating(true);
        try {
            // Auth is attached by the axios interceptor (Bearer token); the
            // old manual `user-id` header was spoofable and is removed.
            const response = await axios.put(`/api/v1/blog/update-blog/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                toast.success("Blog updated successfully!");
                navigate("/my-blogs");
            } else {
                throw new Error(response.data.message || "Failed to update blog");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update blog");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 760, mx: "auto", py: { xs: 4, md: 6 }, px: 2 }}>
            <SectionHeading eyebrow="Writer" title="Edit Blog" align="left" sx={{ mb: 4 }} />

            <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                <InputLabel sx={{ mb: 0.5, color: "text.secondary" }}>Title</InputLabel>
                <TextField name="title" value={inputs.title} onChange={handleChange} fullWidth margin="normal" />

                <InputLabel sx={{ mt: 2, mb: 0.5, color: "text.secondary" }}>Description</InputLabel>
                <Box sx={{ mb: 2, width: "100%" }}>
                    <Box
                        ref={quillRef}
                        sx={{ height: 300, width: "100%" }}
                    />
                </Box>

                <InputLabel sx={{ mb: 0.5, color: "text.secondary" }}>Category</InputLabel>
                <Select name="category" value={inputs.category} onChange={handleChange} fullWidth margin="normal" size="small">
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                </Select>

                <InputLabel sx={{ mt: 2, mb: 0.5, color: "text.secondary" }}>Tags (comma-separated)</InputLabel>
                <TextField
                    name="tags"
                    value={inputs.tags.join(", ")}
                    onChange={(e) =>
                        setInputs({ ...inputs, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                    }
                    fullWidth
                    margin="normal"
                    size="small"
                />

                <InputLabel sx={{ mt: 2, mb: 0.5, color: "text.secondary" }}>Image</InputLabel>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>Current: {inputs.image || "none"}</Typography>

                <GradientButton onClick={handleUpdate} disabled={isUpdating} sx={{ mt: 3, py: 1.25, width: "100%" }}>
                    {isUpdating ? "Updating…" : "Update Blog"}
                </GradientButton>
            </GlassCard>
        </Box>
    );
};

=======
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel } from "@mui/material";
import toast from "react-hot-toast";

const categories = ["Technology", "Education", "Health", "Entertainment", "Food", "Business", "Social Media", "Travel", "News"];

const EditBlog = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ title: "", description: "", category: "", image: "", tags: [] });
    const [uploadedImage, setUploadedImage] = useState(null);
    
    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await axios.get(`/api/v1/blog/get-blog/${id}`);
                if (response.data.success) {
                    const { title, description, category, image, tags } = response.data.blog;
                    const tagNames = tags.map(tag => (tag.tag_name ? tag.tag_name : tag));

                    const strippedDescription = description.replace(/<\/?[^>]+(>|$)/g, "");
                    setInputs({ title, description: strippedDescription, category, image, tags: tagNames });
                } else {
                    toast.error("Failed to load blog details");
                    navigate("/my-blogs");
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
                toast.error("Error fetching blog details");
            }
        };
        fetchBlogDetails();
    }, [id, navigate]);

    const handleChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedImage(file);
        }
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("category", inputs.category);
        formData.append("tags", JSON.stringify(inputs.tags));

        if (uploadedImage) {
            formData.append("image", uploadedImage);
        } else {
            formData.append("image", inputs.image);
        }

        try {
            const response = await axios.put(`/api/v1/blog/update-blog/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "user-id": localStorage.getItem("userId"),
                },
            });

            if (response.data.success) {
                toast.success("Blog updated successfully!");
                navigate("/my-blogs");
                window.location.reload();  
                
            } else {
                throw new Error("Failed to update blog");
            }
        } catch (error) {
            console.error("Error updating blog:", error);
            toast.error("Failed to update blog");
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
            <Typography variant="h4" textAlign="center">Edit Blog</Typography>
            <InputLabel>Title</InputLabel>
            <TextField name="title" value={inputs.title} onChange={handleChange} fullWidth margin="normal" />

            <InputLabel>Description</InputLabel>
            <TextField 
    name="description"
    value={inputs.description} 
    onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
    fullWidth 
    multiline 
    rows={5} 
    margin="normal" 
/>

            <InputLabel>Category</InputLabel>
            <Select name="category" value={inputs.category} onChange={handleChange} fullWidth margin="normal">
                {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
            </Select>

            <InputLabel>Tags (comma-separated)</InputLabel>
            <TextField 
    name="tags"
    value={inputs.tags.join(", ")} 
    onChange={(e) => {
        setInputs({ 
            ...inputs, 
            tags: e.target.value.split(",").map(tag => tag.trim()) 
        });
    }} 
    fullWidth 
    margin="normal" 
/>

            <InputLabel>Image</InputLabel>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Typography variant="body2" sx={{ mt: 1 }}>Current: {inputs.image}</Typography>

            <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 2, width: "100%" }}>
                Update Blog
            </Button>
        </Box>
    );
};

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
export default EditBlog;