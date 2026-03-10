// src/pages/BlogPage.jsx
/**
 * BlogPage - Minimalist & Deluxe Design with Editorial Layout
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds
 * - Changed to split-screen editorial layout: text left (40%), image right (60%)
 * - Added serif typography for editorial, magazine-style feel
 * - Title: bold italic serif with text reflection effect
 * - Content: serif font for better readability
 * - Updated filter buttons: minimalist border style
 * - Blog cards: clean white/dark cards with subtle borders
 * - Simplified animations and removed colorful accents
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "../services/api.js";
import { API_CONFIG } from "../config/api.js";
import ProtectedImage from "../components/ProtectedImage.jsx";
import BlogPostSkeleton from "../components/BlogPostSkeleton.jsx";
import { FileText, Mail, Calendar, Filter, Heart, Eye } from "lucide-react";

// Minimalist background - removed animated blobs
const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'poem', 'letter'
  const [likedPosts, setLikedPosts] = useState(new Set()); // Track which posts are liked
  const [viewedPosts, setViewedPosts] = useState(new Set()); // Track which posts have been viewed
  const [likingPosts, setLikingPosts] = useState(new Set()); // Track which posts are currently being liked/unliked

  // Cookie helper functions for view tracking
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const setCookie = (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  };

  const hasViewedPost = (postId) => {
    // Check cookie first (persistent across sessions)
    const cookieName = `blog_viewed_${postId}`;
    const cookieValue = getCookie(cookieName);
    if (cookieValue === 'true') {
      return true;
    }
    // Also check in-memory state (current session)
    return viewedPosts.has(postId);
  };

  const markPostAsViewed = (postId) => {
    // Set cookie (persistent)
    const cookieName = `blog_viewed_${postId}`;
    setCookie(cookieName, 'true', 365); // Cookie expires in 1 year
    // Also update in-memory state
    setViewedPosts(prev => new Set([...prev, postId]));
  };

  // Helper function to build image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's a full URL (starts with http/https), use it directly
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = API_CONFIG.getBaseURL();
    // Ensure the path starts with / and doesn't have double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Initialize viewed posts from cookies when posts load
  useEffect(() => {
    if (posts && posts.length > 0) {
      // Load viewed posts from cookies directly (don't use hasViewedPost to avoid circular dependency)
      const viewedFromCookies = new Set();
      posts.forEach(post => {
        if (post && post.id) {
          const cookieName = `blog_viewed_${post.id}`;
          const cookieValue = getCookie(cookieName);
          if (cookieValue === 'true') {
            viewedFromCookies.add(post.id);
          }
        }
      });
      if (viewedFromCookies.size > 0) {
        setViewedPosts(viewedFromCookies);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  // Check like status for all posts when they load
  useEffect(() => {
    if (posts && posts.length > 0) {
      checkLikeStatuses();
      trackViews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const type = filter !== "all" ? filter : null;
      const result = await api.blog.getAll(type, "published");

      // SECURITY: Remove console.log in production to prevent information leakage
      if (import.meta.env.DEV) {
        console.log("Blog API Result:", result);
      }

      if (result.success) {
        // API returns: { success: true, data: [...] }
        let postsData = [];

        if (Array.isArray(result.data)) {
          // Direct array response (correct format)
          postsData = result.data;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          // Nested response (fallback)
          postsData = result.data.data;
        } else {
          // No posts yet, but API succeeded - that's OK
          postsData = [];
        }

        // Ensure likes_count and views_count are numbers
        postsData = postsData.map(post => ({
          ...post,
          likes_count: parseInt(post.likes_count) || 0,
          views_count: parseInt(post.views_count) || 0
        }));

        setPosts(postsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setError(null); // Clear any previous errors
      } else {
        // SECURITY: Don't expose detailed error messages to users
        if (import.meta.env.DEV) {
          console.error("API returned error:", result);
        }
        const errorMsg = t("blog.failed-load");
        setError(errorMsg);
      }
    } catch (error) {
      // SECURITY: Don't expose detailed error messages to users
      if (import.meta.env.DEV) {
        console.error("Error fetching posts:", error);
      }
      setError(t("blog.failed-load"));
    } finally {
      setLoading(false);
    }
  };

  // Check like status for all posts
  const checkLikeStatuses = async () => {
    // Skip if no posts
    if (!posts || posts.length === 0) {
      return;
    }
    
    try {
      const likeChecks = posts
        .filter(post => post && post.id) // Safety check
        .map(post => 
          api.blog.getLikeStatus(post.id).catch(() => ({ success: false, data: { liked: false } }))
        );
      const results = await Promise.all(likeChecks);
      
      const liked = new Set();
      results.forEach((result, index) => {
        if (result.success && result.data) {
          // API response structure: { success: true, data: { success: true, data: { liked: true, likes_count: 5 } } }
          // So we need to access result.data.data for the actual API data
          const apiData = result.data.data || result.data;
          const likedStatus = apiData?.liked === true;
        if (likedStatus) {
          liked.add(posts[index].id);
          }
          
          // Update likes_count from API response
          if (apiData?.likes_count !== undefined) {
            setPosts(prevPosts => 
              prevPosts.map(p => 
                p.id === posts[index].id 
                  ? { ...p, likes_count: parseInt(apiData.likes_count) || 0 }
                  : p
              )
            );
          }
        }
      });
      
      setLikedPosts(liked);
    } catch (error) {
      // Silently fail - likes are optional and CORS errors are expected if proxy/server is down
      // Only log non-CORS errors in development mode
      if (import.meta.env.DEV && error.message && !error.message.includes('access control')) {
        console.warn("Error checking like statuses:", error.message);
      }
    }
  };

  // Track views for posts that haven't been viewed yet (using cookies to prevent duplicate views)
  const trackViews = async () => {
    // Skip if no posts
    if (!posts || posts.length === 0) {
      return;
    }
    
    try {
      // Filter posts that haven't been viewed (check both cookie and in-memory state)
      const postsToTrack = posts.filter(post => post && post.id && !hasViewedPost(post.id));
      
      if (postsToTrack.length === 0) {
        return;
      }
      
      // Track views for each post sequentially with a small delay to avoid overwhelming the server
      for (let i = 0; i < postsToTrack.length; i++) {
        const post = postsToTrack[i];
        
        // Small delay between requests
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        try {
          const result = await api.blog.trackView(post.id);
          
          if (result.success && result.data) {
            // API response structure: { success: true, data: { success: true, data: { views_count: 10, view_recorded: true } } }
            const apiData = result.data.data || result.data;
            
            // Only update if view was actually recorded
            if (apiData?.view_recorded !== false) {
              // Mark as viewed using cookie (persistent) and in-memory state
              markPostAsViewed(post.id);
            
              // Update the post's view count from API response
              if (apiData?.views_count !== undefined) {
            setPosts(prevPosts => 
              prevPosts.map(p => 
                p.id === post.id 
                      ? { ...p, views_count: parseInt(apiData.views_count) || 0 }
                  : p
              )
            );
              }
            }
          }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error(`Error tracking view for post ${post.id}:`, error);
          }
          // Mark as viewed even on error to prevent retrying immediately
          markPostAsViewed(post.id);
            }
          }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error tracking views:", error);
      }
    }
  };

  // Handle like/unlike
  const handleLike = async (postId) => {
    // Prevent multiple simultaneous requests for the same post
    if (likingPosts.has(postId)) {
      return;
    }

    try {
      // Set loading state for this specific post
      setLikingPosts(prev => new Set(prev).add(postId));

      // Log API URL for debugging (only in production to help diagnose issues)
      if (import.meta.env.PROD) {
        console.log('[Like Button] API Base URL:', API_CONFIG.getBaseURL());
        console.log('[Like Button] Like endpoint:', API_CONFIG.ENDPOINTS.BLOG_LIKE);
      }

      // Like/unlike the post
      const result = await api.blog.like(postId);
      
      // Log result for debugging
      if (import.meta.env.PROD) {
        console.log('[Like Button] API Response:', result);
      }

      if (result.success && result.data) {
        // API response structure: { success: true, data: { success: true, data: { liked: true, likes_count: 5 } } }
        // So we need to access result.data.data for the actual API data
        const apiData = result.data.data || result.data;
        const { liked, likes_count } = apiData || {};
        
        // Update liked posts set
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (liked === true) {
            newSet.add(postId);
          } else if (liked === false) {
            newSet.delete(postId);
          }
          return newSet;
        });
        
        // Update post's like count in state
        if (likes_count !== undefined) {
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId 
                ? { ...post, likes_count: parseInt(likes_count) || 0 }
                : post
            )
          );
        }
      } else {
        // Handle API error response
        const errorMessage = result.error || result.data?.message || 'Failed to like post. Please try again.';
        console.error('[Like Button] API Error:', errorMessage, result);
        
        // Show user-friendly error (you might want to add a toast notification here)
        alert(errorMessage);
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('[Like Button] Error liking post:', error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('fetch')) {
        console.error('[Like Button] Network error - check API URL:', API_CONFIG.getBaseURL());
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('An error occurred while liking the post. Please try again.');
      }
    } finally {
      // Clear loading state
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const locale = i18n.language === "en" ? "en-US" : "es-ES";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <motion.section
        className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 sm:mb-16"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 leading-tight tracking-tight text-gray-900 dark:text-white text-reflection" data-text={t("blog.title")}>
                {t("blog.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 font-light">
                {t("blog.subtitle")}
              </p>
            </motion.div>

            {/* Loading Skeletons */}
            <div className="space-y-6 sm:space-y-8">
              {[1, 2, 3].map((index) => (
                <BlogPostSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 text-center text-red-500 dark:text-red-400">
          <p>{t("blog.error")}: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeroBackground />
      <div className="relative z-10 container mx-auto max-w-7xl py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 leading-tight tracking-tight text-gray-900 dark:text-white text-reflection" data-text={t("blog.title")}>
            {t("blog.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 font-light">
            {t("blog.subtitle")}
          </p>
        </motion.div>

        {/* Filter Buttons - Modern pill design */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-3 mb-8 sm:mb-12 flex-wrap"
        >
          <motion.button
            onClick={() => setFilter("all")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 flex items-center gap-2 border rounded-2xl modern-shadow ${
              filter === "all"
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white modern-shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:modern-shadow-md"
            }`}
          >
            <Filter size={16} />
            {t("blog.filter-all")}
          </motion.button>
          <motion.button
            onClick={() => setFilter("poem")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 flex items-center gap-2 border rounded-2xl modern-shadow ${
              filter === "poem"
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white modern-shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:modern-shadow-md"
            }`}
          >
            <FileText size={16} />
            {t("blog.filter-poems")}
          </motion.button>
          <motion.button
            onClick={() => setFilter("letter")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 flex items-center gap-2 border rounded-2xl modern-shadow ${
              filter === "letter"
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white modern-shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:modern-shadow-md"
            }`}
          >
            <Mail size={16} />
            {t("blog.filter-letters")}
          </motion.button>
        </motion.div>

        {/* Posts List - Improved spacing between posts */}
        {posts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16"
          >
            {posts.map((post, index) => {
              const cardVariants = {
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut", delay: index * 0.05 },
                },
              };

              return (
                <motion.article
                  key={post.id}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-white dark:bg-[#0f0f0f] modern-border modern-shadow-md modern-card-lg transition-all duration-300 hover:modern-shadow-lg modern-hover"
                >
                  {/* Conditional layout: Image-top with text below OR centered text-only */}
                  {post.image_url ? (
                    /* New design: Image at top, text content below - Magazine style */
                    <div className="flex flex-col">
                      {/* Image Section - Prominent display at top */}
                      <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] relative overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-t-lg modern-shadow">
                        <motion.div
                          className="w-full h-full relative"
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <ProtectedImage
                            src={getImageUrl(post.image_url)}
                            alt={post.title}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              if (e.target) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                          {/* Subtle overlay for better contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        </motion.div>
                      </div>

                      {/* Text Content Section - Below image */}
                      <div className="flex flex-col p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 bg-white dark:bg-[#0f0f0f] rounded-b-lg">
                        {/* Header Section */}
                        <div className="mb-6 sm:mb-8">
                          {/* Title */}
                          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 leading-tight">
                            {post.title}
                          </h2>
                          
                          {/* Location and Date */}
                          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 font-serif mb-6 sm:mb-8">
                            <span className="font-medium">México</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="font-light">{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        {/* Content Section - Clean, readable text */}
                        <div className="mb-8 sm:mb-10">
                          {/* SECURITY: Render content as plain text to prevent XSS - content is sanitized on backend */}
                          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed sm:leading-loose text-base sm:text-lg md:text-xl font-serif font-normal max-w-4xl">
                            {post.content}
                          </div>
                        </div>

                        {/* Footer Section */}
                        <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
                          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            {/* Type badge */}
                            <span className="text-xs sm:text-sm px-4 sm:px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium uppercase tracking-wide rounded-2xl modern-shadow">
                              {post.type === "poem" ? t("blog.type-poem") : t("blog.type-letter")}
                            </span>
                            
                            {/* Views */}
                            {(post.views_count > 0) && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base font-serif">
                                <Eye size={16} className="sm:w-5 sm:h-5" />
                                <span>
                                  {post.views_count} {post.views_count === 1 ? t("blog.view-singular") : t("blog.views")}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Like Button */}
                          <motion.button
                            onClick={() => handleLike(post.id)}
                            disabled={likingPosts.has(post.id)}
                            className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all duration-300 border rounded-2xl modern-shadow ${
                              likingPosts.has(post.id)
                                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-50"
                                : likedPosts.has(post.id)
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-900 dark:border-white hover:bg-gray-200 dark:hover:bg-gray-700 hover:modern-shadow-md"
                                : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:modern-shadow-md"
                            }`}
                            whileHover={likingPosts.has(post.id) ? {} : { scale: 1.02 }}
                            whileTap={likingPosts.has(post.id) ? {} : { scale: 0.98 }}
                            aria-label={likedPosts.has(post.id) ? t("blog.liked") : t("blog.like")}
                            aria-busy={likingPosts.has(post.id)}
                          >
                            <Heart 
                              size={18} 
                              className={`sm:w-5 sm:h-5 ${
                                likingPosts.has(post.id) 
                                  ? "animate-pulse" 
                                  : likedPosts.has(post.id) 
                                  ? "fill-current" 
                                  : ""
                              }`}
                            />
                            <span className="whitespace-nowrap">
                              {likingPosts.has(post.id) ? (
                                <span className="animate-pulse">...</span>
                              ) : (
                                <>
                                  {post.likes_count || 0} {post.likes_count === 1 ? t("blog.like-singular") : t("blog.likes")}
                                </>
                              )}
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text-only layout: Centered, full-width, optimized for reading */
                    <div className="flex flex-col min-h-[400px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">
                      {/* Header Section - Centered */}
                      <div className="text-center mb-6 sm:mb-8 md:mb-10">
                        {/* Title - Better sized for readability */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 leading-tight">
                          {post.title}
                        </h2>
                        
                        {/* Location and Date - Centered */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 font-serif">
                          <span className="font-medium">México</span>
                          <span className="text-gray-400 dark:text-gray-600">•</span>
                          <span className="font-light">{formatDate(post.created_at)}</span>
                        </div>
                      </div>

                      {/* Content Section - Optimized for long text readability */}
                      <div className="flex-1 flex justify-center">
                        <div className="w-full max-w-3xl px-4 sm:px-6 md:px-8">
                          {/* SECURITY: Render content as plain text to prevent XSS - content is sanitized on backend */}
                          {/* Better text size and line height for comfortable reading */}
                          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed sm:leading-loose text-base sm:text-lg md:text-xl font-serif font-normal text-center md:text-left py-3 sm:py-4">
                            {post.content}
                          </div>
                        </div>
                      </div>

                      {/* Footer Section - Centered */}
                      <div className="mt-6 sm:mt-8 md:mt-10 pt-5 sm:pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                          {/* Type badge - Modern pill design */}
                          <span className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium uppercase tracking-wide rounded-2xl modern-shadow">
                            {post.type === "poem" ? t("blog.type-poem") : t("blog.type-letter")}
                          </span>
                          
                          {/* Views - Responsive text size */}
                          {(post.views_count > 0) && (
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-serif">
                              <Eye size={14} className="sm:w-4 sm:h-4" />
                              <span>
                                {post.views_count} {post.views_count === 1 ? t("blog.view-singular") : t("blog.views")}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Like Button - Centered */}
                        <motion.button
                          onClick={() => handleLike(post.id)}
                          disabled={likingPosts.has(post.id)}
                          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 border rounded-2xl modern-shadow ${
                            likingPosts.has(post.id)
                              ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-50"
                              : likedPosts.has(post.id)
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-900 dark:border-white hover:bg-gray-200 dark:hover:bg-gray-700 hover:modern-shadow-md"
                              : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:modern-shadow-md"
                          }`}
                          whileHover={likingPosts.has(post.id) ? {} : { scale: 1.02 }}
                          whileTap={likingPosts.has(post.id) ? {} : { scale: 0.98 }}
                          aria-label={likedPosts.has(post.id) ? t("blog.liked") : t("blog.like")}
                          aria-busy={likingPosts.has(post.id)}
                        >
                          <Heart 
                            size={16} 
                            className={`sm:w-[18px] sm:h-[18px] ${
                              likingPosts.has(post.id) 
                                ? "animate-pulse" 
                                : likedPosts.has(post.id) 
                                ? "fill-current" 
                                : ""
                            }`}
                          />
                          <span className="whitespace-nowrap">
                            {likingPosts.has(post.id) ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              <>
                                {post.likes_count || 0} {post.likes_count === 1 ? t("blog.like-singular") : t("blog.likes")}
                              </>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800"
          >
            <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-light">
              {filter === "all"
                ? t("blog.no-posts")
                : filter === "poem"
                ? t("blog.no-poems")
                : t("blog.no-letters")}
            </p>
          </motion.div>
        )}
        </div>
      </div>
    </motion.section>
  );
};

export default BlogPage;
