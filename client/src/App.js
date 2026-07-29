<<<<<<< HEAD
import React, { lazy, Suspense } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Box, CircularProgress } from '@mui/material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';

// Route-level code-splitting: each page is loaded on demand via React.lazy so
// the initial bundle only contains the shell (Navbar, providers, theme) + the
// page the user actually visits. Admin users never download the reader pages
// and vice-versa. Keep the shell (Navbar, Toaster, providers) eager so the
// chrome renders instantly.
const Home = lazy(() => import("./pages/Home"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UserBlogs = lazy(() => import("./pages/UserBlogs"));
const CreateBlog = lazy(() => import("./pages/CreateBlog"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import("./pages/Profile"));
const Rewards = lazy(() => import("./pages/Rewards"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const AdminPanel = lazy(() => import("./admin/AdminPanel"));

const PageFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
  </Box>
);

function AppWrapper() {
  const { theme } = useTheme();
  const themeInstance = theme === 'dark' ? darkTheme : lightTheme;
=======
import React, { useEffect } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; 
import Navbar from "./components/Navbar";
import { Routes, Route,Navigate,useLocation } from "react-router-dom";
import Blogs from "./pages/Blogs";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from './pages/ForgotPassword';
import UserBlogs from "./pages/UserBlogs";
import CreateBlog from "./pages/CreateBlog";
import BlogDetails from "./pages/BlogDetails";
import { Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';
import Contact from "./pages/Contact"; 
import About from './pages/About';
import Profile from './pages/Profile';
import AdminPanel from "./admin/AdminPanel";
import Rewards from "./pages/Rewards";
import EditBlog from "./pages/EditBlog";

function AppWrapper() {
  const { theme } = useTheme();
  const themeInstance = createTheme(theme === 'light' ? {
    palette: { mode: 'light', background: { default: "#fff" } }
  } : {
    palette: { mode: 'dark', background: { default: "#121212" } }
  });

  useEffect(() => {
    document.body.style.backgroundColor = themeInstance.palette.background.default;
  }, [themeInstance]);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725

  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const isAdmin = user?.role === "Admin";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <MuiThemeProvider theme={themeInstance}>
      <CssBaseline />
<<<<<<< HEAD
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {!isAdminRoute && <Navbar />}
        <Toaster />
        <Box component="main" sx={{ flex: 1 }}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            {!isAdmin && (
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/my-blogs" element={<UserBlogs />} />
                  <Route path="/blog-details/:id" element={<BlogDetails />} />
                  <Route path="/create-blog" element={<CreateBlog />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/category/:category" element={<Blogs />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/edit-blog/:id" element={<EditBlog />} />
                </>
              )}

              {isAdmin ? (
                <Route path="/admin/*" element={<AdminPanel />} />
              ) : (
                <Route path="/admin/*" element={<Navigate to="/" />} />
              )}

              <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/"} />} />
            </Routes>
          </Suspense>
        </Box>
        {!isAdminRoute && <Footer />}
      </Box>
=======
      {!isAdminRoute && <Navbar />}
      <Toaster />
      <Routes>
      {!isAdmin && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/my-blogs" element={<UserBlogs />} />
            <Route path="/blog-details/:id" element={<BlogDetails />} />
            <Route path="/create-blog" element={<CreateBlog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/:category" element={<Blogs />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/edit-blog/:id" element={<EditBlog />} />
          </>
        )}
        
        {isAdmin ? (
          <Route path="/admin/*" element={<AdminPanel />} />
        ) : (
          <Route path="/admin/*" element={<Navigate to="/" />} />
        )}

        <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/"} />} />
      </Routes>
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </AuthProvider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
