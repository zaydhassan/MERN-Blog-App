<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import {
<<<<<<< HEAD
  Typography, InputAdornment, TextField, Box, Grid, Button, CircularProgress, Stack, Chip
} from '@mui/material';
import BlogCard from '../components/BlogCard';
import BlogGrid from '../components/BlogGrid';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import UserAvatar from '../components/UserAvatar';
import SectionHeading from '../components/SectionHeading';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { onActivate } from '../utils/a11y';

const PAGE_SIZE = 9;

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

  // The search box is debounced and sent to the server (?q=), so search covers
  // the whole catalog, not just the currently loaded page. Previously the
  // client fetched every blog up front and filtered in memory — that doesn't
  // scale and breaks once the list is paginated.
  const debounceRef = useRef(null);

  const isCategoryPage = location.pathname.startsWith('/category/');
  const category = isCategoryPage ? location.pathname.split('/').pop() : '';
  const endpoint = isCategoryPage ? `/api/v1/blog/category/${category}` : '/api/v1/blog/all-blog';

  const fetchBlogs = useCallback(async (pageToLoad, query, append) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = { page: pageToLoad, limit: PAGE_SIZE };
      if (query) params.q = query;
      const { data } = await axios.get(endpoint, { params, headers: { "Cache-Control": "no-cache" } });

      const formattedBlogs = (data.blogs || []).map(blog => ({
        ...blog,
        // Keep created_at as the raw ISO date so both the card and the
        // sidebar can format it however they like.
        userAvatar: blog.user?.profile_image,
        tags: Array.isArray(blog.tags)
          ? blog.tags.map(tag => tag?.tag_name?.trim()).filter(tag => tag && tag.length > 0)
          : []
      }));

      setBlogs(prev => append ? [...prev, ...formattedBlogs] : formattedBlogs);
      setHasMore(Boolean(data.hasMore));
      setPage(pageToLoad);
      setFetchError(false);
    } catch (error) {
      // Distinguish a fetch failure from a genuinely empty result: on a
      // non-append error we surface an error state (with retry) instead of
      // the "No blogs found" empty state.
      if (!append) {
        setBlogs([]);
        setFetchError(true);
      }
      setHasMore(false);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }, [endpoint]);

  // Route (category) change → reset to page 1.
  useEffect(() => {
    setSearchQuery('');
    fetchBlogs(1, '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Debounced search → reset to page 1 with the new query.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBlogs(1, searchQuery, false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleLoadMore = () => fetchBlogs(page + 1, searchQuery, true);
  const handleCategoryClick = (cat) => navigate(`/category/${cat}`);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
=======
  Typography,InputAdornment, TextField,Box, Grid, Button, CircularProgress,Avatar,CardMedia
} from '@mui/material';
import BlogCard from '../components/BlogCard'; 
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`);
};

useEffect(() => {
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const categoryPath = location.pathname;
      const isCategoryPage = categoryPath.startsWith('/category/');
      const category = isCategoryPage ? categoryPath.split('/').pop() : '';
      const endpoint = isCategoryPage ? `/api/v1/blog/category/${category}` : '/api/v1/blog/all-blog';

const { data } = await axios.get(endpoint, { 
  headers: {
    "Cache-Control": "no-cache"
  }
});
      if (data.success) {
        console.log("Fetched Blogs Data:", data.blogs); 
  
        const formattedBlogs = data.blogs.map(blog => ({
          ...blog,
          created_at: moment(blog.created_at).isValid() ? moment(blog.created_at).format('MMM DD') : "Unknown Date",
          userAvatar: blog.user?.profile_image || "/default-avatar.png",
          tags: Array.isArray(blog.tags)
          ? blog.tags
              .map(tag => tag?.tag_name?.trim()) 
              .filter(tag => tag && tag.length > 0) 
          : []
      }));
      
        setBlogs(formattedBlogs);
        setFilteredBlogs(formattedBlogs);
      } else {
        setBlogs([]);
        setFilteredBlogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      setBlogs([]);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchBlogs();
  }, [location.pathname]);
  
useEffect(() => {
  const filtered = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  setFilteredBlogs(filtered);
}, [searchQuery, blogs]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" marginTop="50px">
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        <CircularProgress />
      </Box>
    );
  }

  return (
<<<<<<< HEAD
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      {/* Search */}
      <Box display="flex" justifyContent="center" mb={4}>
        <TextField
          placeholder="Search blogs…"
          variant="outlined"
          fullWidth
          aria-label="Search blogs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 560 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Main column */}
        <Grid item xs={12} md={8}>
          <SectionHeading
            eyebrow={isCategoryPage ? 'Category' : 'Featured'}
            title={isCategoryPage ? `Blogs in ${category}` : 'Featured Blogs'}
            badge
          />
          <BlogGrid sx={{ mt: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
            {blogs.map((blog, index) => (
              <BlogCard
                key={blog._id || index}
=======
    
    <Box sx={{ 
      backgroundColor: theme.palette.mode === 'dark' ? "#121212" : "#ffffff", 
      color: theme.palette.mode === 'dark' ? "#ffffff" : "#000000",
      minHeight: '100vh', 
      padding: 4 
    }}>
    
    <style>
      {`
       .neon-effect {
      border: 2px solid #000;
      border-radius: 50px;
       background-color:#B2FFFF;
      color: #000;
      transition: box-shadow 0.3s ease, background-color 0.3s ease;
    }

    .neon-effect:hover {
      background-color: #4bff00;
      box-shadow: 0 0 25px #9dff00, 0 0 50px #9dff00, 0 0 100px #9dff00, 0 0 250px rgba(0, 0, 0, 0.8);
    }
          .custom-search-box {
            width: 310px;
            padding: 5px 20px;
            background-color: #fff;
            border-radius: 50px;
            border: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            position: relative;
            background-image: linear-gradient(120deg, #fbc2eb, #a6c1ee);
          }

          .custom-search-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50px;
            padding: 2px;
            background: linear-gradient(45deg, #ff9a9e, #fad0c4, #fbc2eb);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            mask-composite: exclude;
          }

          input {
            width: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: #333;
            font-size: 1rem;
          }
        `}
      </style>

       <Box display="flex" justifyContent="center" marginBottom={4}>
        <Box className="custom-search-box">
        <TextField
        placeholder="Search blogs..."
         variant="standard"
          fullWidth
        InputProps={{
           startAdornment: (
           <InputAdornment position="start">
           <SearchIcon style={{ color: "#333" }} /> 
          </InputAdornment>
          ),
    disableUnderline: true,
    sx: {
      "&::placeholder": {
        color: "#fff !important", 
        opacity: 1,
      },
      color: "#000", 

    },
  }}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
        </Box>
      </Box>

    <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" marginBottom={3}  sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#111" }}>
          {location.pathname.includes('/category/') ? `Blogs in ${location.pathname.split('/').pop()}` : 'Featured Blogs'}
          </Typography>
          <Grid container spacing={2}>
          {filteredBlogs.map((blog, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <BlogCard
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
                id={blog._id}
                title={blog.title}
                description={blog.description}
                image={blog.image}
<<<<<<< HEAD
                username={blog.user && blog.user.username ? blog.user.username : 'Unknown'}
                time={moment(blog.created_at).format('MMM DD, YYYY')}
                profileImage={blog.userAvatar}
                tags={blog.tags}
              />
            ))}
          </BlogGrid>

          {fetchError ? (
            <Box textAlign="center" mt={5}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Couldn’t load blogs. Please try again.</Typography>
              <GradientButton onClick={() => fetchBlogs(1, searchQuery, false)}>Retry</GradientButton>
            </Box>
          ) : blogs.length === 0 ? (
            <Box textAlign="center" mt={5}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No blogs found{searchQuery ? ` for “${searchQuery}”` : ''}.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                {searchQuery && (
                  <Button variant="outlined" onClick={() => setSearchQuery('')}>Clear search</Button>
                )}
                <Button variant="outlined" onClick={() => navigate('/blogs')}>Browse all blogs</Button>
              </Stack>
            </Box>
          ) : null}

          {hasMore && (
            <Box display="flex" justifyContent="center" mt={5}>
              <GradientButton onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Load More'}
              </GradientButton>
            </Box>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3, mt: { xs: 0, md: 4 }, position: 'sticky', top: 88 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>Browse</Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>Categories</Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mb: 4 }}>
              {categories.map((cat) => {
                const isActive = location.pathname.includes(`/category/${cat}`);
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'filled' : 'outlined'}
                    onClick={() => handleCategoryClick(cat)}
                    sx={{ cursor: 'pointer' }}
                  />
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TrendingUpIcon color="primary" fontSize="small" />
              <Typography variant="h6">Trending</Typography>
            </Stack>
            {blogs.slice(0, 5).map((blog, index) => (
              <Box
                key={blog._id}
                role="button"
                tabIndex={0}
                sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer', borderRadius: 2, p: 1, transition: 'background-color .2s ease', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => navigate(`/blog-details/${blog._id}`)}
                onKeyDown={onActivate(() => navigate(`/blog-details/${blog._id}`))}
              >
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800, minWidth: 34 }}>
                  0{index + 1}
                </Typography>
                <UserAvatar src={blog.userAvatar} name={blog.user?.username} sx={{ width: 36, height: 36, mx: 1.5, fontSize: 14 }} />
                <Box flexGrow={1} sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {blog.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {blog.user?.username || 'Unknown'} · {moment(blog.created_at).format('MMM DD')}
                  </Typography>
                </Box>
              </Box>
            ))}
          </GlassCard>
=======
                username={blog.user && blog.user.username ? blog.user.username : "Unknown"}

                time={moment(blog.created_at).format('MMM DD, YYYY')}
                profileImage={blog.userAvatar} 
                tags={blog.tags}
              />
            </Grid>
          ))}
        </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
        <Typography 
  variant="h5" 
  fontWeight="bold" 
  marginTop={5} 
  marginBottom={3}
  sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#111" }}
>
  Browse Categories
</Typography>
          <Grid container spacing={2} justifyContent="center">
  {categories.map((category, index) => {
    const isActive = location.pathname.includes(`/category/${category}`);
    return (
      <Grid item xs={4} key={index} style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          className={`neon-effect ${isActive ? 'active-category' : ''}`}
          style={{
            borderRadius: '50px',
            minWidth: 'auto',
            padding: '10px 18px',
            textTransform: 'none',
            fontWeight: 'bold',
            width: '100%',
            backgroundColor: isActive ? "#4bff00" : theme.palette.mode === 'dark' ? "#B2FFFF" : "#d4eaff",
            color: isActive ? "#000" : theme.palette.mode === 'dark' ? "#000" : "#333",
            boxShadow: isActive
            ? '0 0 5px #9dff00, 0 0 20px #9dff00, 0 0 20px #9dff00'
            : 'none',  
          border: isActive ? '2px solid #9dff00' : '2px solid transparent'
        }}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </Button>
      </Grid>
    );
  })}
</Grid>

          <Typography variant="h5" fontWeight="bold" marginTop={4} marginBottom={2}  sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#111" }}>
            Trending ↝
          </Typography>
          {blogs.slice(0, 5).map((blog, index) => (
            <Box key={blog._id} sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, cursor: 'pointer', color: '#fff' }} onClick={() => navigate(`/blog-details/${blog._id}`)}>
              <Box sx={{ minWidth: '50px', marginRight: '10px' }}>
                <Typography variant="h4" fontWeight="bold"   sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#111" }}
                >
                  0{index + 1}
                </Typography>
              </Box>
              <Avatar src={blog.userAvatar} sx={{ width: 40, height: 40, marginRight: '10px' }} alt={blog.user?.username || "User"} />
              <Box flexGrow={1}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#111" }}
                >
                  {blog.title}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === "dark" ? "#bbb" : "#555" }}
                >
  {blog.user?.username || "Unknown"}
</Typography>
<Typography 
  variant="caption" 
  sx={{ color: theme.palette.mode === 'dark' ? "gray" : "#555" }}
>
  {moment(blog.created_at).format('MMM DD')}
</Typography>
              </Box>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 60, marginLeft: 'auto', borderRadius: '5px' }}
                image={blog.image}
                alt={blog.title}
              />
            </Box>
          ))}
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
        </Grid>
      </Grid>
    </Box>
  );
};

export default Blogs;