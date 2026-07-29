import React, { useState } from 'react';
<<<<<<< HEAD
import { Box, TextField, Typography, Container, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateEmail, validateMinLength, validateFields } from "../utils/validate";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import SectionHeading from "../components/SectionHeading";

=======
import { Box, Button, TextField, Typography, Container, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTheme } from '@mui/material/styles';
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
<<<<<<< HEAD
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
=======
    const theme = useTheme();

    const handleSubmit = async (event) => {
      event.preventDefault();
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      const toastId = toast.loading("⏳ Sending your message...", {
          position: "top-center",
          theme: "dark",
          transition: Slide
      });
<<<<<<< HEAD

      try {
          const response = await fetch('/api/v1/contact', {
=======
  
      try {
          const response = await fetch('http://localhost:8080/api/v1/contact', {  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, message }),
          });
<<<<<<< HEAD

=======
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
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
<<<<<<< HEAD
=======
          console.error('Error:', error);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
          toast.update(toastId, {
              render: "Error sending message. Try again.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
              transition: Bounce
          });
<<<<<<< HEAD
      } finally {
          setIsSending(false);
      }
  };

=======
      }
  };
  
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
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
<<<<<<< HEAD
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
=======
        <Container component="main" maxWidth={false} sx={{
            height: '100vh',
            backgroundImage: 'url(/contactus.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#FFFFFF', 
            backgroundColor: '#121212' 
        }}>
            <Paper elevation={6} sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                maxWidth: 'lg',
                width: '100%',
                height: 'auto',
                backgroundColor: 'rgba(55, 55, 55, 0.6)', 
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF' 
            }}>
                <Box sx={{
                    p: 3,
                    width: { xs: '100%', md: '50%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><LocationOnIcon sx={{ color: '#FFFFFF' }} /></ListItemIcon>
                            <ListItemText primary="abc 123, India" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><EmailIcon sx={{ color: '#FFFFFF' }} /></ListItemIcon>
                            <ListItemText primary="zaydthirteen@gmail.com" />
                        </ListItem>
                    </List>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{
                    p: 3,
                    width: { xs: '100%', md: '50%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
                        Send Message
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                            onChange={(e) => setName(e.target.value)}
                           sx={{
    input: {
      color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", 
      backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)", 
      padding: "12px",
      borderRadius: "8px",
    },
    fieldset: {
      borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)", 
    },
  }}
  InputLabelProps={{
    style: { 
      color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)", 
      fontWeight: "bold",
    }
  }}
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
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                input: {
                                  color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", 
                                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)", // Light grey in light mode
                                  padding: "12px",
                                  borderRadius: "8px",
                                },
                                fieldset: {
                                  borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)", 
                                },
                              }}
                              InputLabelProps={{
                                style: { 
                                  color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)", 
                                  fontWeight: "bold",
                                }
                              }}
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
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{
                                input: {
                                  color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", 
                                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)", // Light grey in light mode
                                  padding: "12px",
                                  borderRadius: "8px",
                                },
                                fieldset: {
                                  borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)", 
                                },
                              }}
                              InputLabelProps={{
                                style: { 
                                  color: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)", 
                                  fontWeight: "bold",
                                }
                              }}
                            />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, backgroundColor: '#1a73e8' }} 
                        >
                            Send Message
                        </Button>
                    </Box>
                </Box>
            </Paper>
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        </Container>
      </>
    );
}