import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Box, Button, InputLabel, TextField, Typography, Select, MenuItem, IconButton, Stack } from "@mui/material";
import toast from "react-hot-toast";
import 'quill/dist/quill.snow.css';
import '../styles/quill-terracotta.css';
=======
import { Box, Button, InputLabel, TextField, Typography, Select, MenuItem, styled, useTheme, IconButton } from "@mui/material";
import toast from "react-hot-toast";
import 'quill/dist/quill.snow.css';
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
import Quill from 'quill';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useLocation } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "../context/AuthContext";
import { validateMinLength, validateRequired } from "../utils/validate";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import SectionHeading from "../components/SectionHeading";

const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

// Quill stores content as HTML; an "empty" editor still holds tags like
// <p><br></p>, so strip tags to tell whether the user actually wrote anything.
const stripHtml = (html) => (html || '').replace(/<\/?[^>]+(>|$)/g, '').trim();

const CreateBlog = () => {
  const navigate = useNavigate();
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

=======

const StyledFormBox = styled(Box)(({ theme }) => ({
  width: "55%",
  border: "none",
  borderRadius: "20px",
  padding: theme.spacing(3),
  margin: `${theme.spacing(-3)} auto`,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark'
    ? `12px 12px 24px #bebebe, -12px -12px 24px #ffffff`
    : `12px 12px 24px #d9d9d9, -12px -12px 24px #ffffff`,
  transition: "all 0.3s ease-in-out"
}));

const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

const CreateBlog = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const id = localStorage.getItem("userId");
  const [inputs, setInputs] = useState({ title: "", description: "", image: "", category: "" });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  
  const location = useLocation();
  const editingBlog = location.state?.blog || null;
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  useEffect(() => {
      if (editingBlog) {
          setInputs({
              title: editingBlog.title || "",
              description: editingBlog.description || "",
              image: editingBlog.image || "",
              category: editingBlog.category || "",
              tags: editingBlog.tags ? editingBlog.tags.join(", ") : "",
          });
<<<<<<< HEAD

=======
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
          if (quillInstance.current) {
              quillInstance.current.root.innerHTML = editingBlog.description || "";
          }
      }
  }, [editingBlog]);
<<<<<<< HEAD

=======
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (quillInstance.current && transcript) {
      quillInstance.current.root.innerHTML += ` ${transcript}`;
      setInputs((prev) => ({ ...prev, description: quillInstance.current.root.innerHTML }));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
<<<<<<< HEAD
    // Wait for auth state to resolve before gating. Non-writers are bounced;
    // an unauthenticated user (user stays null) is left to the server, which
    // rejects the create call and the interceptor redirects to login.
    if (!user) return;
=======
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    if (userRole !== 'Writer') {
      toast.error('Only Writers can create blogs');
      navigate('/');
    }
<<<<<<< HEAD
  }, [navigate, user, userRole]);
=======
  }, [navigate, userRole]);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

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
<<<<<<< HEAD

=======
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      quillInstance.current.on('text-change', () => {
        setInputs((prev) => ({
          ...prev,
          description: quillInstance.current.root.innerHTML,
        }));
      });
    }
  }, [])
<<<<<<< HEAD

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
=======
  
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setUploadedImage(file); 
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
};

const handleBlogAction = async (status) => {
  const formData = new FormData();
  formData.append("title", inputs.title);
  formData.append("description", inputs.description);
  formData.append("category", inputs.category);
  formData.append("status", status);
<<<<<<< HEAD

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

=======
  formData.append("user", id);
    
  const formattedTags = inputs.tags ? inputs.tags.split(",").map(tag => tag.trim()) : [];
  formData.append("tags", JSON.stringify(formattedTags)); 
 
  if (uploadedImage) {
    formData.append("image", uploadedImage);
} else if (inputs.image) {
    formData.append("image", inputs.image);
} else {
    toast.error("Please upload an image or provide an image URL.");
    return;
}
    if (!inputs.title || !inputs.description || !inputs.category || (!inputs.image && !uploadedImage)) {
      toast.error("Please provide all required fields, including an image.");
      return;
    }

    try {
      
      const response = await axios.post("/api/v1/blog/create-blog", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "user-id": localStorage.getItem("userId"), 
        },
      });
      
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      if (response.data.success) {
        toast.success(`Blog ${status === 'Published' ? 'published' : 'saved as draft'}`, { icon: '👏' });
        navigate("/my-blogs");
      } else {
        throw new Error(`Failed to ${status.toLowerCase()} blog.`);
      }
    } catch (error) {
<<<<<<< HEAD
      toast.error(`Failed to ${status.toLowerCase()} blog: ` + (error.response ? error.response.data.message : "Please try again."));
    } finally {
      setSubmittingStatus(null);
=======
      console.error("Failed to create blog:", error);
      toast.error(`Failed to ${status.toLowerCase()} blog: ` + (error.response ? error.response.data.message : "Check the console for more information."));
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <form style={{
      backgroundImage: "url('./create.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ alignSelf: 'flex-end', padding: theme.spacing(2) }}>
        <Button onClick={() => handleBlogAction('Published')} variant="contained" style={{ marginRight: 15 }}>
          Publish
        </Button>
        <Button onClick={() => handleBlogAction('Draft')} variant="outlined">
          Save Draft
        </Button>
      </div>
      <StyledFormBox
       sx={{ width: { xs: "90%", sm: "75%", md: "55%" } }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" paddingBottom={0} paddingTop={0} color={theme.palette.text.primary}>
          Create A Blog
        </Typography>
        <InputLabel>Title</InputLabel>
        <TextField name="title"  fullWidth value={inputs.title} onChange={handleChange} variant="outlined" required size="small" />

        <InputLabel>Description</InputLabel>
        <div style={{ marginBottom: '12px', width: '100%' }}>
          <div
            ref={quillRef}
            style={{
              height: 250,
              width: '100%',
              padding: '10px',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <IconButton
            onClick={() => {
              listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true });
            }}
            color={listening ? "secondary" : "primary"}
            style={{ marginLeft: '12px', marginTop: '10px' }}
          >
            {listening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </div>

        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={inputs.category}
          onChange={handleChange}
          fullWidth
          required
        >
          {categories.map((category, index) => (
            <MenuItem key={index} value={category}>{category}</MenuItem>
          ))}
        </Select>
        <TextField
  name="tags"
  placeholder="Enter tags separated by commas"
  value={inputs.tags || ''}
  onChange={handleChange}
/>
        <InputLabel>Choose Image Source</InputLabel>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Button variant="contained" onClick={() => setUseImageUrl(true)}>Use Image URL</Button>
          <Button variant="contained" onClick={() => setUseImageUrl(false)}>Upload Image</Button>
        </div>
        {useImageUrl ? (
          <TextField name="image" value={inputs.image} onChange={handleChange} variant="outlined" fullWidth size="small" />
        ) : (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        )}
      </StyledFormBox>
    </form>
  );
};

export default CreateBlog;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
