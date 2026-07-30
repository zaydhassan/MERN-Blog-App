import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Button, InputLabel, TextField, Typography, Select, MenuItem, IconButton, Stack } from "@mui/material";
import toast from "react-hot-toast";
import 'quill/dist/quill.snow.css';
import '../styles/quill-terracotta.css';
import Quill from 'quill';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateMinLength, validateRequired } from "../utils/validate";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import SectionHeading from "../components/SectionHeading";
import { celebrateAchievement } from "../components/Celebration";
import { setGamification, fetchUnreadCount } from "../redux/store";

const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

// Quill stores content as HTML; an "empty" editor still holds tags like
// <p><br></p>, so strip tags to tell whether the user actually wrote anything.
const stripHtml = (html) => (html || '').replace(/<\/?[^>]+(>|$)/g, '').trim();

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Read auth from context (single source of truth) instead of localStorage.
  // The server identifies the author from the JWT (req.user._id), so we no
  // longer append a spoofable "user" field or send the legacy "user-id" header.
  const { user } = useAuth();
  const userRole = user?.role;
  const [inputs, setInputs] = useState({ title: "", description: "", image: "", category: "" });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  // Which action is in flight (null | 'Published' | 'Draft') so both buttons
  // disable during a submit and the active one shows a loading label.
  const [submittingStatus, setSubmittingStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  const location = useLocation();
  const editingBlog = location.state?.blog || null;

  useEffect(() => {
      if (editingBlog) {
          setInputs({
              title: editingBlog.title || "",
              description: editingBlog.description || "",
              image: editingBlog.image || "",
              category: editingBlog.category || "",
              tags: editingBlog.tags ? editingBlog.tags.join(", ") : "",
          });

          if (quillInstance.current) {
              quillInstance.current.root.innerHTML = editingBlog.description || "";
          }
      }
  }, [editingBlog]);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (quillInstance.current && transcript) {
      quillInstance.current.root.innerHTML += ` ${transcript}`;
      setInputs((prev) => ({ ...prev, description: quillInstance.current.root.innerHTML }));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    // Wait for auth state to resolve before gating. Non-writers are bounced;
    // an unauthenticated user (user stays null) is left to the server, which
    // rejects the create call and the interceptor redirects to login.
    if (!user) return;
    if (userRole !== 'Writer') {
      toast.error('Only Writers can create blogs');
      navigate('/');
    }
  }, [navigate, user, userRole]);

  useEffect(() => {
    if (!quillInstance.current && quillRef.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Write something amazing...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
          ],
        },
      });

      quillInstance.current.on('text-change', () => {
        setInputs((prev) => ({
          ...prev,
          description: quillInstance.current.root.innerHTML,
        }));
      });
    }
  }, [])

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setErrors((prev) => { const next = { ...prev }; delete next[e.target.name]; return next; });
  };

  const setFieldError = (field, msg) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setUploadedImage(file);
        setFieldError("image", "");
    }
};

const handleBlogAction = async (status) => {
  const formData = new FormData();
  formData.append("title", inputs.title);
  formData.append("description", inputs.description);
  formData.append("category", inputs.category);
  formData.append("status", status);

  const formattedTags = inputs.tags ? inputs.tags.split(",").map(tag => tag.trim()) : [];
  formData.append("tags", JSON.stringify(formattedTags));

  if (uploadedImage) {
    formData.append("image", uploadedImage);
  } else if (inputs.image) {
    formData.append("image", inputs.image);
  }

    // Inline field-level validation before submitting. Surface errors per
    // field instead of a single generic toast so the user knows what to fix.
    const found = {
      title: validateMinLength(inputs.title, 2, "Title"),
      category: validateRequired(inputs.category, "Category"),
      description: stripHtml(inputs.description) ? "" : "Description is required.",
      image: (uploadedImage || inputs.image) ? "" : "Please upload an image or provide an image URL.",
    };
    const hasErrors = Object.values(found).some(Boolean);
    setErrors(hasErrors ? found : {});
    if (hasErrors) return;

    setSubmittingStatus(status);
    try {

      const response = await axios.post("/api/v1/blog/create-blog", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(`Blog ${status === 'Published' ? 'published' : 'saved as draft'}`, { icon: '👏' });
        // Publishing awards points server-side; sync the store + celebrate any
        // level-up / badge earned on publish. Drafts earn nothing.
        if (status === 'Published' && response.data.points !== undefined) {
          dispatch(setGamification({ points: response.data.points, level: response.data.level, badges: response.data.badges }));
          celebrateAchievement({ leveledUp: response.data.leveledUp, newBadges: response.data.newBadges, level: response.data.level });
          if (response.data.leveledUp || (response.data.newBadges && response.data.newBadges.length)) dispatch(fetchUnreadCount());
        }
        navigate("/my-blogs");
      } else {
        throw new Error(`Failed to ${status.toLowerCase()} blog.`);
      }
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} blog: ` + (error.response ? error.response.data.message : "Please try again."));
    } finally {
      setSubmittingStatus(null);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "url('./create.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ maxWidth: 760, mx: "auto", px: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
          <SectionHeading eyebrow="Write" title="Create a Blog" align="left" sx={{ mb: 0 }} />
          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={() => handleBlogAction('Draft')}
              variant="outlined"
              color="primary"
              disabled={submittingStatus !== null}
            >
              {submittingStatus === 'Draft' ? 'Saving…' : 'Save Draft'}
            </Button>
            <GradientButton
              onClick={() => handleBlogAction('Published')}
              disabled={submittingStatus !== null}
            >
              {submittingStatus === 'Published' ? 'Publishing…' : 'Publish'}
            </GradientButton>
          </Stack>
        </Stack>

        <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
          <InputLabel sx={{ mb: 0.5, color: "text.secondary" }}>Title</InputLabel>
          <TextField
            name="title"
            fullWidth
            value={inputs.title}
            onChange={handleChange}
            onBlur={() => setFieldError("title", validateMinLength(inputs.title, 2, "Title"))}
            error={Boolean(errors.title)}
            helperText={errors.title}
            required
            size="small"
            sx={{ mb: 2 }}
          />

          <InputLabel sx={{ mb: 0.5, color: "text.secondary" }}>Description</InputLabel>
          <Box sx={{ mb: 1, width: "100%" }}>
            <Box
              ref={quillRef}
              sx={{ height: 250, width: "100%" }}
            />
            <IconButton
              onClick={() => {
                listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true });
              }}
              color={listening ? "secondary" : "primary"}
              aria-label={listening ? "Stop dictation" : "Start dictation"}
              sx={{ mt: 1 }}
            >
              {listening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            {errors.description && (
              <Typography color="error" variant="caption" sx={{ display: "block", ml: 1 }}>
                {errors.description}
              </Typography>
            )}
          </Box>

          <InputLabel sx={{ mt: 1, mb: 0.5, color: "text.secondary" }}>Category</InputLabel>
          <Select
            name="category"
            value={inputs.category}
            onChange={handleChange}
            onBlur={() => setFieldError("category", validateRequired(inputs.category, "Category"))}
            error={Boolean(errors.category)}
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
          >
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>{category}</MenuItem>
            ))}
          </Select>
          {errors.category && (
            <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>
              {errors.category}
            </Typography>
          )}

          <TextField
            name="tags"
            placeholder="Enter tags separated by commas"
            value={inputs.tags || ''}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          <InputLabel sx={{ mb: 0.5, color: "text.secondary" }}>Choose Image Source</InputLabel>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            <Button variant={useImageUrl ? "contained" : "outlined"} color="primary" size="small" onClick={() => setUseImageUrl(true)}>Use Image URL</Button>
            <Button variant={!useImageUrl ? "contained" : "outlined"} color="primary" size="small" onClick={() => setUseImageUrl(false)}>Upload Image</Button>
          </Stack>
          {useImageUrl ? (
            <TextField name="image" value={inputs.image} onChange={handleChange} fullWidth size="small" />
          ) : (
            <input type="file" accept="image/*" onChange={handleFileChange} />
          )}
          {errors.image && (
            <Typography color="error" variant="caption" sx={{ display: "block", mt: 1 }}>
              {errors.image}
            </Typography>
          )}
        </GlassCard>
      </Box>
    </Box>
  );
};

export default CreateBlog;
