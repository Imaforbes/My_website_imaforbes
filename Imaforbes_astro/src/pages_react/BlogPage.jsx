import withProviders from '../components/withProviders.jsx';
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { useTranslation } from "react-i18next";
import { api } from "../services/api.js";
import { API_CONFIG } from "../config/api.js";
import ProtectedImage from "../components/ProtectedImage.jsx";
import BlogPostSkeleton from "../components/BlogPostSkeleton.jsx";
import { FileText, Mail, Filter, Heart, Eye, ArrowLeft, ArrowRight, Search } from "lucide-react";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-light)' }} className="dark:hidden"></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-dark)' }} className="hidden dark:block"></div>
    
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
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Read URL query parameter for routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('post');
    if (postParam) {
      setSelectedPostId(postParam);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      setSelectedPostId(currentParams.get('post'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openPost = (id) => {
    setSelectedPostId(id);
    window.history.pushState({}, '', `?post=${id}`);
    window.scrollTo(0, 0);
  };

  const closePost = () => {
    setSelectedPostId(null);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo(0, 0);
  };

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
    const cookieName = `blog_viewed_${postId}`;
    const cookieValue = getCookie(cookieName);
    if (cookieValue === 'true') {
      return true;
    }
    return viewedPosts.has(postId);
  }, [getCookie, viewedPosts]);

  const markPostAsViewed = useCallback((postId) => {
    const cookieName = `blog_viewed_${postId}`;
    setCookie(cookieName, 'true', 365);
    setViewedPosts(prev => new Set([...prev, postId]));
  }, [setCookie]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/img/placeholder-project.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = API_CONFIG.getBaseURL();
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    if (cleanPath.startsWith('uploads/')) {
        return `${baseUrl}/${cleanPath}`;
    }
    
    return `${baseUrl}/uploads/images/${cleanPath}`;
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
        }

        postsData = postsData.map((post) => ({
          ...post,
          likes_count: parseInt(post.likes_count) || 0,
          views_count: parseInt(post.views_count) || 0,
        }));

        setPosts(postsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setError(null);
      } else {
        if (import.meta.env.DEV) console.error("API returned error:", result);
        setError(t("blog.failed-load"));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching posts:", error);
      setError(t("blog.failed-load"));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (posts && posts.length > 0) {
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

  useEffect(() => {
    if (!selectedPostId) return;

    const fetchPostData = async () => {
      // 1. Get like status for the opened post
      try {
        const result = await api.blog.getLikeStatus(selectedPostId);
        if (result.success && result.data) {
          const apiData = result.data.data || result.data;
          if (apiData?.liked === true) {
            setLikedPosts((prev) => {
              const newSet = new Set(prev);
              newSet.add(selectedPostId);
              return newSet;
            });
          }
          if (apiData?.likes_count !== undefined) {
            setPosts((prevPosts) =>
              prevPosts.map((p) =>
                p.id == selectedPostId ? { ...p, likes_count: parseInt(apiData.likes_count) || 0 } : p
              )
            );
          }
        }
      } catch (error) {
        console.error('Blog operation failed:', error);
      }

      // 2. Track view for the opened post
      if (!hasViewedPost(selectedPostId)) {
        try {
          const result = await api.blog.trackView(selectedPostId);
          if (result.success && result.data) {
            const apiData = result.data.data || result.data;
            if (apiData?.view_recorded !== false) {
              markPostAsViewed(selectedPostId);
              if (apiData?.views_count !== undefined) {
                setPosts((prevPosts) =>
                  prevPosts.map((p) => (p.id == selectedPostId ? { ...p, views_count: parseInt(apiData.views_count) || 0 } : p))
                );
              }
            }
          }
        } catch (error) {
          console.error('Blog operation failed:', error);
        }
      }
    };

    fetchPostData();
  }, [selectedPostId, hasViewedPost, markPostAsViewed]);

  const handleLike = async (postId) => {
    if (likingPosts.has(postId)) return;

    try {
      setLikingPosts(prev => new Set(prev).add(postId));

      const result = await api.blog.like(postId);

      if (result.success && result.data) {
        const apiData = result.data.data || result.data;
        const { liked, likes_count } = apiData || {};
        
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (liked === true) newSet.add(postId);
          else if (liked === false) newSet.delete(postId);
          return newSet;
        });
        
        if (likes_count !== undefined) {
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId 
                ? { ...post, likes_count: parseInt(likes_count) || 0 }
                : post
            )
          );
        }
      }
    } catch (error) {
      console.error('[Like Button] Error liking post:', error);
    } finally {
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
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredPosts = normalizedSearch
    ? posts.filter((post) => `${post.title || ''} ${post.content || ''}`.toLocaleLowerCase().includes(normalizedSearch))
    : posts;

  if (loading) {
    return (
      <motion.section className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden" variants={containerVariants} initial="hidden" animate="visible">
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <BlogPostSkeleton />
            <BlogPostSkeleton />
          </div>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <HeroBackground />
        <div className="relative z-10 text-center text-red-500"><p>{error}</p></div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedPostId) {
    const selectedPost = posts.find(p => p.id == selectedPostId);
    if (selectedPost) {
      return (
        <section className="relative min-h-screen bg-white dark:bg-[#0a0a0a]" style={{ paddingTop: '6rem' }}>
          <HeroBackground />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container-premium" 
            style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}
          >
            <button 
              onClick={closePost} 
              className="btn-premium" 
              style={{ marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--color-text-light)', padding: '0.5rem 0' }}
            >
              <ArrowLeft size={18} /> {t("blog.back", "Volver")}
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="project-tag" style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '0.3rem 0.8rem', marginBottom: '1.5rem', display: 'inline-block' }}>
                {selectedPost.type === "poem" ? t("blog.type-poem") : t("blog.type-letter")}
              </span>
              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, color: 'var(--color-text-light)', marginBottom: '1.5rem', lineHeight: 1.2, wordBreak: 'break-word' }} className="dark:text-white">
                {selectedPost.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-text-muted-light)', fontSize: '1rem' }}>
                <span style={{ fontWeight: 500 }}>México</span>
                <span>•</span>
                <span style={{ fontWeight: 400 }}>{formatDate(selectedPost.created_at)}</span>
                {(selectedPost.views_count > 0) && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={16} /> {selectedPost.views_count}
                    </span>
                  </>
                )}
              </div>
            </div>

            {selectedPost.image_url && (
              <div style={{ width: '100%', height: 'auto', maxHeight: '500px', marginBottom: '3.5rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}>
                <ProtectedImage
                  src={getImageUrl(selectedPost.image_url)}
                  alt={selectedPost.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div 
              className="dark:text-gray-300" 
              style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.15rem', fontWeight: 400, wordBreak: 'break-word', paddingBottom: '3rem' }}
            >
              {selectedPost.content ? selectedPost.content.trim() : ''}
            </div>
            
            <div style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'center' }} className="dark:border-gray-800">
               <button
                 onClick={() => handleLike(selectedPost.id)}
                 disabled={likingPosts.has(selectedPost.id)}
                 className="btn-premium"
                 style={{ 
                   background: likedPosts.has(selectedPost.id) ? 'var(--color-text-light)' : 'transparent',
                   color: likedPosts.has(selectedPost.id) ? 'var(--color-bg-light)' : 'var(--color-text-light)',
                   padding: '0.75rem 2.5rem',
                   fontSize: '1.1rem',
                   borderRadius: '30px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   border: '1px solid var(--color-border-light)'
                 }}
               >
                 <Heart size={20} className={likedPosts.has(selectedPost.id) ? "fill-current" : ""} />
                 <span style={{ fontWeight: 500 }}>{selectedPost.likes_count || 0} Likes</span>
               </button>
            </div>
          </motion.div>
        </section>
      );
    }
  }

  // --- LIST VIEW ---
  return (
    <section className="projects-section" style={{ minHeight: '100svh' }}>
      <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
        
        <div className="projects-header" style={{ position: 'relative', paddingTop: '0rem' }}>
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
          style={{ maxWidth: '580px', margin: '0 auto 1.25rem', position: 'relative' }}
        >
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted-light)' }} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('blog.search-placeholder')}
            aria-label={t('blog.search-label')}
            className="dark:bg-[#111] dark:border-gray-800 dark:text-white"
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '999px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface-light)', color: 'var(--color-text-light)', outline: 'none' }}
          />
        </motion.div>

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
              display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "all" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "all" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <Filter size={16} /> <span>{t("blog.filter-all")}</span>
          </button>
          <button
            onClick={() => setFilter("poem")}
            className={`project-tag ${filter === "poem" ? 'active' : ''}`}
            style={{ 
              cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "poem" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "poem" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <FileText size={16} /> <span>{t("blog.filter-poems")}</span>
          </button>
          <button
            onClick={() => setFilter("letter")}
            className={`project-tag ${filter === "letter" ? 'active' : ''}`}
            style={{ 
              cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
              background: filter === "letter" ? 'var(--color-text-light)' : 'transparent',
              color: filter === "letter" ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
            }}
          >
            <Mail size={16} /> <span>{t("blog.filter-letters")}</span>
          </button>
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '2.5rem',
              maxWidth: '1200px', 
              margin: '0 auto',
              alignItems: 'stretch'
            }}
          >
            {filteredPosts.map((post, index) => {
              const cardVariants = {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: index * 0.05 } }
              };

              return (
                <BorderBeam key={post.id} theme="dark" size="pulse-inner" duration={6} colorVariant="ocean" className="rounded-2xl relative w-full h-full">
                  <motion.article
                    variants={cardVariants}
                    className="card-premium h-full"
                    style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                  {post.image_url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
                        <ProtectedImage
                          src={getImageUrl(post.image_url)}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.5rem', lineHeight: 1.3, wordBreak: 'break-word' }} className="dark:text-white">
                            {post.title}
                          </h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 500 }}>México</span>
                            <span>•</span>
                            <span style={{ fontWeight: 400 }}>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                          <div style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', fontWeight: 400, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="dark:text-gray-300">
                            {post.content ? post.content.trim() : ''}
                          </div>
                        </div>
                        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }} className="dark:border-gray-800">
                          <button onClick={() => openPost(post.id)} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-text-light)' }}>
                            {t("blog.read-more")} <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.5rem', lineHeight: 1.3, wordBreak: 'break-word' }} className="dark:text-white">
                          {post.title}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 500 }}>México</span>
                          <span>•</span>
                          <span style={{ fontWeight: 400 }}>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem', flex: 1 }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', fontWeight: 400, textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="dark:text-gray-300">
                            {post.content ? post.content.trim() : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }} className="dark:border-gray-800">
                        <button onClick={() => openPost(post.id)} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-text-light)' }}>
                          {t("blog.read-more")} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  </motion.article>
                </BorderBeam>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '4rem 2rem' }} className="card-premium">
            <FileText size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-text-muted-light)' }} />
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted-light)', fontWeight: 300 }}>
              {normalizedSearch ? t('blog.no-search-results') : filter === "all" ? t("blog.no-posts") : t("blog.no-posts-filter")}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default withProviders(BlogPage);
