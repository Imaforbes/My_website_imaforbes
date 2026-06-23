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
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "../services/api.js";
import { API_CONFIG } from "../config/api.js";
import ProtectedImage from "../components/ProtectedImage.jsx";
import BlogPostSkeleton from "../components/BlogPostSkeleton.jsx";
import { FileText, Mail, Calendar, Filter, Heart, Eye } from "lucide-react";

// Minimalist background - removed animated blobs
const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-light)' }} className="dark:hidden"></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-dark)' }} className="hidden dark:block"></div>
    
    {/* Subtle animated gradient glow */}
    <motion.div 
      initial={{ opacity: 0.1, scale: 0.9 }}
      animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
      style={{ 
        position: 'absolute', 
        top: '15%', 
        right: '10%', 
        width: '50vw', 
        height: '50vw', 
        background: 'radial-gradient(circle, rgba(150,150,150,0.03) 0%, rgba(0,0,0,0) 60%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}
    />
    
    {/* Grid pattern very faint */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(100,100,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
      maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
    }} />
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
  const getCookie = useCallback((name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }, []);

  const setCookie = useCallback((name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }, []);

  const hasViewedPost = useCallback((postId) => {
    // Check cookie first (persistent across sessions)
    const cookieName = `blog_viewed_${postId}`;
    const cookieValue = getCookie(cookieName);
    if (cookieValue === 'true') {
      return true;
    }
    // Also check in-memory state (current session)
    return viewedPosts.has(postId);
  }, [getCookie, viewedPosts]);

  const markPostAsViewed = useCallback((postId) => {
    // Set cookie (persistent)
    const cookieName = `blog_viewed_${postId}`;
    setCookie(cookieName, 'true', 365); // Cookie expires in 1 year
    // Also update in-memory state
    setViewedPosts(prev => new Set([...prev, postId]));
  }, [setCookie]);

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

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const type = filter !== "all" ? filter : null;
      const result = await api.blog.getAll(type, "published");


      if (result.success) {
        let postsData = [];

        if (Array.isArray(result.data)) {
          postsData = result.data;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          postsData = result.data.data;
        } else {
          postsData = [];
        }

        postsData = postsData.map((post) => ({
          ...post,
          likes_count: parseInt(post.likes_count) || 0,
          views_count: parseInt(post.views_count) || 0,
        }));

        setPosts(postsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setError(null);
      } else {
        if (import.meta.env.DEV) {
          console.error("API returned error:", result);
        }
        setError(t("blog.failed-load"));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching posts:", error);
      }
      setError(t("blog.failed-load"));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  }, [getCookie, posts]);

  // Check like status for all posts when they load
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const run = async () => {
      // Check like statuses
      try {
        const likeChecks = posts
          .filter((post) => post && post.id)
          .map((post) => api.blog.getLikeStatus(post.id).catch(() => ({ success: false, data: { liked: false } })));

        const results = await Promise.all(likeChecks);
        const liked = new Set();

        results.forEach((result, index) => {
          if (result.success && result.data) {
            const apiData = result.data.data || result.data;
            const likedStatus = apiData?.liked === true;
            if (likedStatus) {
              liked.add(posts[index].id);
            }

            if (apiData?.likes_count !== undefined) {
              setPosts((prevPosts) =>
                prevPosts.map((p) =>
                  p.id === posts[index].id ? { ...p, likes_count: parseInt(apiData.likes_count) || 0 } : p
                )
              );
            }
          }
        });

        setLikedPosts(liked);
      } catch (error) {
        if (import.meta.env.DEV && error?.message && !error.message.includes("access control")) {
          console.warn("Error checking like statuses:", error.message);
        }
      }

      // Track views
      try {
        const postsToTrack = posts.filter((post) => post && post.id && !hasViewedPost(post.id));
        for (let i = 0; i < postsToTrack.length; i++) {
          const post = postsToTrack[i];
          if (i > 0) await new Promise((resolve) => setTimeout(resolve, 100));

          const result = await api.blog.trackView(post.id);
          if (result.success && result.data) {
            const apiData = result.data.data || result.data;
            if (apiData?.view_recorded !== false) {
              markPostAsViewed(post.id);
              if (apiData?.views_count !== undefined) {
                setPosts((prevPosts) =>
                  prevPosts.map((p) => (p.id === post.id ? { ...p, views_count: parseInt(apiData.views_count) || 0 } : p))
                );
              }
            }
          }
        }
      } catch (error) {
        if (import.meta.env.DEV && error?.message && !error.message.includes("access control")) {
          console.warn("Error tracking views:", error.message);
        }
      }
    };

    run();
  }, [hasViewedPost, markPostAsViewed, posts]);

  // (removed legacy helper functions below; logic is handled inside the effect)
/*
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
*/

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
    <section className="projects-section" style={{ minHeight: '100svh' }}>
      <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
        
        <div className="projects-header" style={{ position: 'relative', paddingTop: '1rem' }}>
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="projects-title"
          >
            {t("blog.title")}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-muted"
            style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}
          >
            {t("blog.subtitle")}
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '4rem' }}
        >
          <button
            onClick={() => setFilter("all")}
            className={`project-tag ${filter === "all" ? 'active' : ''}`}
            style={{ 
              cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "all" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "all" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <Filter size={16} />
            <span>{t("blog.filter-all")}</span>
          </button>
          <button
            onClick={() => setFilter("poem")}
            className={`project-tag ${filter === "poem" ? 'active' : ''}`}
            style={{ 
              cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "poem" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "poem" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <FileText size={16} />
            <span>{t("blog.filter-poems")}</span>
          </button>
          <button
            onClick={() => setFilter("letter")}
            className={`project-tag ${filter === "letter" ? 'active' : ''}`}
            style={{ 
              cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "letter" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "letter" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <Mail size={16} />
            <span>{t("blog.filter-letters")}</span>
          </button>
        </motion.div>

        {posts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '2rem', 
              maxWidth: '1200px', 
              margin: '0 auto',
              alignItems: 'start'
            }}
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
                  className="card-premium"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  {post.image_url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
                        <ProtectedImage
                          src={getImageUrl(post.image_url)}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            if (e.target) {
                              e.target.style.display = 'none';
                            }
                          }}
                        />
                      </div>

                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, textAlign: post.type === 'poem' ? 'center' : 'left' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.5rem', lineHeight: 1.3 }} className="dark:text-white">
                            {post.title}
                          </h2>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: post.type === 'poem' ? 'center' : 'flex-start', gap: '0.5rem', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 500 }}>México</span>
                            <span>•</span>
                            <span style={{ fontWeight: 300 }}>{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                          <div style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '1rem', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="dark:text-gray-300">
                            {post.content}
                          </div>
                        </div>

                        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }} className="dark:border-gray-800">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="project-tag" style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                              {post.type === "poem" ? t("blog.type-poem") : t("blog.type-letter")}
                            </span>
                            
                            {(post.views_count > 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted-light)', fontSize: '0.8rem' }}>
                                <Eye size={14} />
                                <span>{post.views_count}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleLike(post.id)}
                            disabled={likingPosts.has(post.id)}
                            className="btn-premium"
                            style={{ 
                              background: likedPosts.has(post.id) ? 'var(--color-text-light)' : 'transparent',
                              color: likedPosts.has(post.id) ? 'var(--color-bg-light)' : 'var(--color-text-light)',
                              padding: '0.35rem 0.8rem',
                              opacity: likingPosts.has(post.id) ? 0.5 : 1,
                              fontSize: '0.85rem'
                            }}
                          >
                            <Heart size={14} className={likedPosts.has(post.id) ? "fill-current" : ""} />
                            <span style={{ marginLeft: '4px' }}>
                              {post.likes_count || 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.5rem', lineHeight: 1.3 }} className="dark:text-white">
                          {post.title}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 500 }}>México</span>
                          <span>•</span>
                          <span style={{ fontWeight: 300 }}>{formatDate(post.created_at)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', flex: 1 }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '1rem', fontWeight: 300, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="dark:text-gray-300">
                            {post.content}
                          </div>
                        </div>
                      </div>

                      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }} className="dark:border-gray-800">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="project-tag" style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {post.type === "poem" ? t("blog.type-poem") : t("blog.type-letter")}
                          </span>
                          
                          {(post.views_count > 0) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted-light)', fontSize: '0.8rem' }}>
                              <Eye size={14} />
                              <span>{post.views_count}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={likingPosts.has(post.id)}
                          className="btn-premium"
                          style={{ 
                            background: likedPosts.has(post.id) ? 'var(--color-text-light)' : 'transparent',
                            color: likedPosts.has(post.id) ? 'var(--color-bg-light)' : 'var(--color-text-light)',
                            padding: '0.35rem 0.8rem',
                            opacity: likingPosts.has(post.id) ? 0.5 : 1,
                            fontSize: '0.85rem'
                          }}
                        >
                          <Heart size={14} className={likedPosts.has(post.id) ? "fill-current" : ""} />
                          <span style={{ marginLeft: '4px' }}>
                            {post.likes_count || 0}
                          </span>
                        </button>
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
            style={{ textAlign: 'center', padding: '4rem 2rem' }}
            className="card-premium"
          >
            <FileText size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-text-muted-light)' }} />
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted-light)', fontWeight: 300 }}>
              {filter === "all"
                ? t("blog.no-posts")
                : t("blog.no-posts-filter")}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
