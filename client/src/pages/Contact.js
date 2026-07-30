import React, { useState } from 'react';
import { Box, TextField, Typography, Container, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateEmail, validateMinLength, validateFields } from "../utils/validate";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import SectionHeading from "../components/SectionHeading";

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errors, setErrors] = useState({});

    const setFieldError = (field, msg) =>
        setErrors((prev) => {
            const next = { ...prev };
            if (msg) next[field] = msg;
            else delete next[field];
            return next;
        });

    const handleSubmit = async (event) => {
      event.preventDefault();
      const found = validateFields(
        { name, email, message },
        {
          name: (v) => validateMinLength(v, 2, "Name"),
          email: (v) => validateEmail(v),
          message: (v) => validateMinLength(v, 10, "Message"),
        }
      );
      setErrors(found || {});
      if (found) return;
      setIsSending(true);
      const toastId = toast.loading("⏳ Sending your message...", {
          position: "top-center",
          theme: "dark",
          transition: Slide
      });

      try {
          const response = await fetch('/api/v1/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, message }),
          });

          const data = await response.json();
          if (response.ok) {
              toast.update(toastId, {
                  render: "Message sent successfully!",
                  type: "success",
                  isLoading: false,
                  autoClose: 3000,
                  transition: Zoom
              });
              setName('');
              setEmail('');
              setMessage('');
          } else {
              toast.update(toastId, {
                  render: "❌ " + (data.message || "Error sending message."),
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                  transition: Flip
              });
          }
      } catch (error) {
          toast.update(toastId, {
              render: "Error sending message. Try again.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
              transition: Bounce
          });
      } finally {
          setIsSending(false);
      }
  };

    return (
      <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
      />
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <SectionHeading
            eyebrow="Get in touch"
            title="Contact us"
            subtitle="Questions, feedback, or just want to say hello — we'd love to hear from you."
            align="center"
            sx={{ mb: 6 }}
          />

          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <GlassCard sx={{ p: 4, height: "100%" }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Contact Information</Typography>
                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 40, height: 40, borderRadius: 2,
                        bgcolor: "brandSoft", color: "secondary.main",
                      }}>
                        <LocationOnIcon fontSize="small" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary="abc 123, India" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 40, height: 40, borderRadius: 2,
                        bgcolor: "brandSoft", color: "secondary.main",
                      }}>
                        <EmailIcon fontSize="small" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary="zaydthirteen@gmail.com" />
                  </ListItem>
                </List>
              </GlassCard>
            </Grid>

            <Grid item xs={12} md={7}>
              <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Send a message</Typography>
                <Box component="form" noValidate onSubmit={handleSubmit}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    margin="normal"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldError("name", ""); }}
                    onBlur={() => setFieldError("name", validateMinLength(name, 2, "Name"))}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                  />
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError("email", ""); }}
                    onBlur={() => setFieldError("email", validateEmail(email))}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                  />
                  <TextField
                    required
                    fullWidth
                    id="message"
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    margin="normal"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setFieldError("message", ""); }}
                    onBlur={() => setFieldError("message", validateMinLength(message, 10, "Message"))}
                    error={Boolean(errors.message)}
                    helperText={errors.message}
                  />
                  <GradientButton type="submit" fullWidth disabled={isSending} sx={{ mt: 3, py: 1.25 }}>
                    {isSending ? "Sending…" : "Send Message"}
                  </GradientButton>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Container>
      </>
    );
}