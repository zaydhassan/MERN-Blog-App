import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography, TextField, Box, IconButton, InputAdornment, Stack, Divider } from "@mui/material";
import { Visibility, VisibilityOff, Email as EmailIcon, Lock as LockIcon } from "@mui/icons-material";
import axios from "axios";
import { useDispatch } from "react-redux";
import { authActions } from "../redux/store";
import { setAccessToken } from "../utils/auth";
import { validateEmail, validatePassword, validateFields } from "../utils/validate";
import NotificationBanner from "./NotificationBanner";
import AuthSplitLayout from "../components/AuthSplitLayout";
import GradientButton from "../components/GradientButton";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { signInWithGoogle } from "../firebase/googleAuth";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ email: "", password: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [showWavingHand, setShowWavingHand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setFieldError = (field, msg) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });

  const handleChange = (e) =>
    setInputs((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleGoogle = () => {
    setIsGoogleLoading(true);
    signInWithGoogle({
      dispatch,
      navigate,
      onError: (message) => {
        setBannerMessage(message);
        setShowWavingHand(false);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      },
    }).finally(() => setIsGoogleLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate before hitting the network. Login is lenient on password
    // length (legacy users may have shorter passwords) — only require it.
    const found = validateFields(inputs, {
      email: (v) => validateEmail(v),
      password: (v) => validatePassword(v, { min: 1 }),
    });
    setErrors(found || {});
    if (found) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/v1/user/login", {
        email: inputs.email,
        password: inputs.password,
      });

      if (data.success) {
        // Store the short-lived access token; the refresh token is already
        // set as an httpOnly cookie by the server. data.user is a safe
        // object (no password hash).
        setAccessToken(data.accessToken);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);

        dispatch(authActions.login(data.user));

        // Navigate immediately — no artificial delay. The navbar reflects
        // the logged-in state on the destination page.
        const target = data.user.role === "Admin" ? "/admin" : "/";
        navigate(target);
      } else {
        setBannerMessage(data.message || "Login failed! Please try again.");
        setShowWavingHand(false);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
    } catch (error) {
      setBannerMessage("Login failed! Please try again.");
      setShowWavingHand(false);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      image="/login.jpg"
      eyebrow="Welcome back"
      headline="Sign in to Inkwell"
      tagline="Pick up where you left off and keep the conversation going."
      highlights={[
        { title: "Welcome back", body: "Your drafts, comments, and reading history are right where you left them." },
        { title: "Stay in the loop", body: "Never miss a reply or a new story from the writers you follow." },
        { title: "Built for night owls", body: "A polished light & dark experience that follows you across every page." },
      ]}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "Plus Jakarta Sans, Inter, sans-serif", mb: 0.5 }}>
        Login
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        Enter your credentials to access your account.
      </Typography>

      {showBanner && (
        <Box sx={{ mb: 2.5 }}>
          <NotificationBanner message={bannerMessage} showHand={showWavingHand} />
        </Box>
      )}

      <Box sx={{ width: "100%", mb: 1 }}>
        <GoogleSignInButton onClick={handleGoogle} loading={isGoogleLoading} />
      </Box>

      <Divider sx={{ my: 2.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>or</Typography>
      </Divider>

      <form style={{ width: "100%" }} onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          fullWidth
          margin="normal"
          required
          name="email"
          autoComplete="email"
          value={inputs.email}
          onChange={(e) => { handleChange(e); setFieldError("email", ""); }}
          onBlur={() => setFieldError("email", validateEmail(inputs.email))}
          error={Boolean(errors.email)}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          fullWidth
          margin="normal"
          required
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={inputs.password}
          onChange={(e) => { handleChange(e); setFieldError("password", ""); }}
          onBlur={() => setFieldError("password", validatePassword(inputs.password, { min: 1 }))}
          error={Boolean(errors.password)}
          helperText={errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Link to="/forgot-password" style={{ textDecoration: "none" }}>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>Forgot password?</Typography>
          </Link>
        </Box>

        <GradientButton type="submit" fullWidth disabled={isSubmitting} sx={{ mt: 2.5, py: 1.35, fontSize: "1rem" }}>
          {isSubmitting ? "Signing in…" : "Sign In"}
        </GradientButton>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>New to Inkwell?</Typography>
        </Divider>

        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Don't have an account?</Typography>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>Create one free</Typography>
          </Link>
        </Stack>
      </form>
    </AuthSplitLayout>
  );
};

export default Login;