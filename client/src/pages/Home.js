import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Typography, Skeleton, Stack } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { validateEmail } from '../utils/validate';
import BlogGrid from '../components/BlogGrid';
import BlogCard from '../components/BlogCard';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import SectionHeading from '../components/SectionHeading';

const heroImages = ['/hero.png', '/hero1.png', '/hero2.png', '/hero3.jpg'];

// How many recent posts to surface on the landing page.
const HOME_BLOG_LIMIT = 6;

const Home = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogsError, setBlogsError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real, published posts for the landing grid instead of hardcoding
  // dummy cards. A loading skeleton fills the grid while the request is in
  // flight; a failure shows a retry control rather than an empty grid.
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        setBlogsError(false);
        const { data } = await axios.get(`/api/v1/blog/all-blog?page=1&limit=${HOME_BLOG_LIMIT}`);
        setBlogs(data.success ? data.blogs || [] : []);
      } catch (error) {
        setBlogsError(true);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleSubscribe = async () => {
    const err = validateEmail(email);
    setEmailError(err);
    if (err) {
      setErrorMessage('');
      setSuccessMessage('');
      return;
    }
    setIsSubscribing(true);
    try {
      const response = await axios.post('/api/v1/newsletter/subscribe', { email });
      if (response.data.success) {
        setSuccessMessage("You're in! Check your inbox to confirm. 🎉");
        setErrorMessage('');
        setEmail('');
      } else {
        throw new Error('Subscription failed.');
      }
    } catch (error) {
      setErrorMessage("We couldn't subscribe you — please try again in a moment.");
      setSuccessMessage('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '60vh', md: '72vh' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(22,18,16,0.55) 0%, rgba(194,65,12,0.35) 100%)',
          },
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              mb: 3,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography variant="overline" sx={{ color: '#fff', letterSpacing: '0.14em' }}>
              ✦ Earn rewards for every post you publish
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              maxWidth: 760,
              mt: 1,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}
          >
            Where great writing finds its readers
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 620, mt: 2.5, lineHeight: 1.7 }}>
            Inkwell is a modern home for writers and readers. Publish rich stories,
            grow an audience, and earn points, badges, and rewards for the words you share.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }} alignItems={{ sm: 'center' }}>
            <GradientButton size="large" onClick={() => navigate('/blogs')}>
              Explore Blogs
            </GradientButton>
            <GradientButton
              size="large"
              sx={{
                bgcolor: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.55)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: '#fff' },
              }}
              onClick={() => navigate('/register')}
            >
              Start writing
            </GradientButton>
          </Stack>
          <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)', mt: 2.5 }}>
            Free to join · Reader &amp; Writer roles · Light &amp; dark mode
          </Typography>
        </Container>
      </Box>

      {/* Newsletter */}
      <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -6 }, position: 'relative', zIndex: 2 }}>
        <GlassCard sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <SectionHeading
            eyebrow="Stay in the loop"
            title="Get the best of Inkwell, weekly"
            subtitle="Fresh stories, writer spotlights, and platform updates — no spam, unsubscribe anytime."
            align="center"
            sx={{ mb: 3 }}
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="center"
            alignItems="center"
          >
            <TextField
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={() => setEmailError(validateEmail(email))}
              error={Boolean(emailError)}
              helperText={emailError}
              sx={{ width: '100%', maxWidth: 400 }}
            />
            <GradientButton onClick={handleSubscribe} disabled={isSubscribing} sx={{ whiteSpace: 'nowrap' }}>
              {isSubscribing ? 'Subscribing…' : 'Subscribe'}
            </GradientButton>
          </Stack>
          {successMessage && (
            <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>{successMessage}</Typography>
          )}
          {errorMessage && (
            <Typography variant="body2" sx={{ mt: 2, color: 'error.main' }}>{errorMessage}</Typography>
          )}
        </GlassCard>
      </Container>

      {/* Recent posts */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <SectionHeading
            eyebrow="Fresh ink"
            title="Latest from the community"
            subtitle="Hand-picked stories, fresh off the press."
            badge
            align="left"
            sx={{ mb: 0 }}
          />
          {!loadingBlogs && !blogsError && blogs.length > 0 && (
            <Link to="/blogs" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>
                View all →
              </Typography>
            </Link>
          )}
        </Box>
        <BlogGrid sx={{ mt: 3 }}>
          {loadingBlogs ? (
            // Skeleton placeholders keep the grid's shape while posts load.
            Array.from({ length: HOME_BLOG_LIMIT }).map((_, i) => (
              <GlassCard key={i} sx={{ p: 0 }}>
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <Box sx={{ p: 2.5 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} animation="wave" />
                  <Skeleton variant="text" animation="wave" />
                  <Skeleton variant="text" animation="wave" width="80%" />
                </Box>
              </GlassCard>
            ))
          ) : blogsError ? (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>We couldn't load the latest stories. Please try again.</Typography>
              <GradientButton
                onClick={() => {
                  setBlogsError(false);
                  setLoadingBlogs(true);
                  axios
                    .get(`/api/v1/blog/all-blog?page=1&limit=${HOME_BLOG_LIMIT}`)
                    .then(({ data }) => setBlogs(data.blogs || []))
                    .catch(() => setBlogsError(true))
                    .finally(() => setLoadingBlogs(false));
                }}
              >
                Retry
              </GradientButton>
            </Box>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                id={blog._id}
                title={blog.title}
                description={blog.description}
                image={blog.image || '/tech1.jpeg'}
                username={blog.user?.username}
                profileImage={blog.user?.profile_image}
                time={blog.created_at}
                tags={blog.tags?.map((t) => (typeof t === 'string' ? t : t?.tag_name)).filter(Boolean)}
              />
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>No stories published yet — be the first to share one.</Typography>
              <GradientButton onClick={() => navigate('/register')}>Start writing</GradientButton>
            </Box>
          )}
        </BlogGrid>
      </Container>
    </Box>
  );
};

export default Home;