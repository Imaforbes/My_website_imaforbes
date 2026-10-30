import withProviders from '../components/withProviders.jsx';
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "../services/api.js";
import { API_CONFIG } from "../config/api.js";
import ProtectedImage from "../components/ProtectedImage.jsx";
import BlogPostSkeleton from "../components/BlogPostSkeleton.jsx";
import { validateComment, checkCommentCooldown, recordCommentTimestamp } from "../utils/commentModeration.js";
import { FileText, Mail, Filter, Heart, Eye, ArrowLeft, ArrowRight, Search, MessageCircle, Send } from "lucide-react";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    
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

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentHoneypot, setCommentHoneypot] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState(null); // { type: 'success' | 'error', text: string }

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
    const numericId = Number(postId);
    const cookieName = `blog_viewed_${numericId}`;
    const cookieValue = getCookie(cookieName);
    if (cookieValue === 'true') {
      return true;
    }
    return viewedPosts.has(numericId) || viewedPosts.has(postId);
  }, [getCookie, viewedPosts]);

  const markPostAsViewed = useCallback((postId) => {
    const numericId = Number(postId);
    const cookieName = `blog_viewed_${numericId}`;
    setCookie(cookieName, 'true', 365);
    setViewedPosts(prev => new Set([...prev, numericId]));
  }, [setCookie]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/img/placeholder-project.webp';
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
          const isLiked = apiData?.liked === true || apiData?.hasLiked === true;
          setLikedPosts((prev) => {
            const newSet = new Set(prev);
            if (isLiked) newSet.add(Number(selectedPostId));
            else newSet.delete(Number(selectedPostId));
            return newSet;
          });
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

      // 3. Load approved comments for the opened post
      try {
        setLoadingComments(true);
        const commentsResult = await api.blog.getComments(selectedPostId);
        if (commentsResult.success && Array.isArray(commentsResult.data)) {
          setComments(commentsResult.data);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    setCommentFeedback(null);
    fetchPostData();
  }, [selectedPostId, hasViewedPost, markPostAsViewed]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPostId || submittingComment) return;

    // 1. Honeypot check (if filled by a bot, silently pretend success)
    if (commentHoneypot && commentHoneypot.trim().length > 0) {
      setCommentContent("");
      setCommentFeedback({ type: "success", text: t("blog.comments-success") });
      return;
    }

    // 2. Cooldown check (Rate limit)
    const cooldown = checkCommentCooldown();
    if (!cooldown.allowed) {
      setCommentFeedback({
        type: "error",
        text: t("blog.comments-error-cooldown", { seconds: cooldown.remainingSeconds }),
      });
      return;
    }

    // 3. Content & Profanity validation
    const validation = validateComment(commentAuthor, commentContent);
    if (!validation.valid) {
      let errorMsg = t("blog.comments-error-length");
      if (validation.reason === "inappropriate_content") {
        errorMsg = t("blog.comments-error-inappropriate");
      } else if (validation.reason === "links_not_allowed") {
        errorMsg = t("blog.comments-error-links");
      }
      setCommentFeedback({ type: "error", text: errorMsg });
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentFeedback(null);

      const result = await api.blog.addComment(selectedPostId, commentAuthor, commentContent);
      if (result.success && result.data) {
        setComments((prev) => [result.data, ...prev]);
        setCommentContent("");
        recordCommentTimestamp();
        setCommentFeedback({ type: "success", text: t("blog.comments-success") });
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setCommentFeedback({ type: "error", text: t("blog.error") });
    } finally {
      setSubmittingComment(false);
    }
  };

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
      <motion.section className="relative min-h-screen bg-surface dark:bg-[#0a0a0a] text-text dark:text-text overflow-hidden" variants={containerVariants} initial="hidden" animate="visible">
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
      <div className="relative min-h-screen bg-surface dark:bg-[#0a0a0a] flex items-center justify-center">
        <HeroBackground />
        <div className="relative z-10 text-center text-red-500"><p>{error}</p></div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedPostId) {
    const selectedPost = posts.find(p => p.id == selectedPostId);
    if (selectedPost) {
      // Calculate reading time (assuming 225 words per minute)
      const wordCount = selectedPost.content ? selectedPost.content.trim().split(/\s+/).length : 0;
      const readingTimeMin = Math.max(1, Math.ceil(wordCount / 225));
      return (
        <section className="relative min-h-screen bg-surface dark:bg-[#0a0a0a]" style={{ paddingTop: '6rem' }}>
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
              className="ecosystem-cta" 
              style={{ marginBottom: '2.5rem', cursor: 'pointer' }}
            >
              <ArrowLeft size={15} /> {t("blog.back", "Volver")}
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="project-tag" style={{ marginBottom: '1.25rem', display: 'inline-block' }}>
                {selectedPost.type === "poem" ? t("blog.type-poem") : selectedPost.type === "letter" ? t("blog.type-letter") : t("blog.type-article")}
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', fontWeight: 400, color: 'var(--color-text)', marginBottom: '1.25rem', lineHeight: 1.02, wordBreak: 'break-word' }}>
                {selectedPost.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>México</span>
                <span>·</span>
                <span>{formatDate(selectedPost.created_at)}</span>
                <span>·</span>
                <span>{readingTimeMin} min de lectura</span>
                {(selectedPost.views_count > 0) && (
                  <>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Eye size={14} /> {selectedPost.views_count}
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

            <div className="blog-content-premium dark:text-text-muted">
              {selectedPost.content ? selectedPost.content.trim() : ''}
            </div>
            
            <div style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }} className="dark:border-strong">
               <button
                 onClick={() => handleLike(selectedPost.id)}
                 disabled={likingPosts.has(selectedPost.id)}
                 className="btn-premium"
                 style={{ 
                   background: likedPosts.has(selectedPost.id) ? 'var(--color-text)' : 'transparent',
                   color: likedPosts.has(selectedPost.id) ? 'var(--color-bg)' : 'var(--color-text)',
                   padding: '0.75rem 2.5rem',
                   fontSize: '1.1rem',
                   borderRadius: '30px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   border: '1px solid var(--color-border)'
                 }}
               >
                 <Heart size={20} className={likedPosts.has(selectedPost.id) ? "fill-current" : ""} />
                 <span style={{ fontWeight: 500 }}>{selectedPost.likes_count || 0} Likes</span>
               </button>
            </div>

            {/* --- COMMENTS SECTION --- */}
            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--color-border)' }} className="dark:border-strong">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                    <MessageCircle size={22} />
                    {t("blog.comments-title", "Comentarios")}
                    <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                      ({comments.length})
                    </span>
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                    {t("blog.comments-subtitle", "Comparte tus pensamientos sobre esta publicación")}
                  </p>
                </div>
              </div>

              {/* Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                className="card-premium"
                style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Honeypot anti-bot field (hidden from humans) */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }}>
                  <label htmlFor="website_url">Website</label>
                  <input
                    id="website_url"
                    name="website_url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={commentHoneypot}
                    onChange={(e) => setCommentHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="comment-author" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {t("blog.comments-name-label", "Tu nombre o alias")}
                  </label>
                  <input
                    id="comment-author"
                    type="text"
                    required
                    maxLength={60}
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder={t("blog.comments-name-placeholder", "Ej. Ana, Lector anónimo...")}
                    className="dark:bg-[#111] dark:border-strong dark:text-text"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="comment-content" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)' }}>
                      {t("blog.comments-content-label", "Tu comentario")}
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {commentContent.length}/500
                    </span>
                  </div>
                  <textarea
                    id="comment-content"
                    required
                    rows={3}
                    maxLength={500}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={t("blog.comments-content-placeholder", "Escribe un mensaje respetuoso...")}
                    className="dark:bg-[#111] dark:border-strong dark:text-text"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.95rem',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6
                    }}
                  />
                </div>

                <AnimatePresence>
                  {commentFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: commentFeedback.type === 'error' ? '#ef4444' : 'var(--color-text)'
                      }}
                    >
                      {commentFeedback.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="btn-premium"
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '9999px',
                      background: 'var(--color-text)',
                      color: 'var(--color-bg)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: submittingComment ? 'not-allowed' : 'pointer',
                      opacity: submittingComment ? 0.7 : 1,
                      minHeight: '44px'
                    }}
                  >
                    <Send size={16} />
                    <span>
                      {submittingComment
                        ? t("blog.comments-submitting", "Publicando...")
                        : t("blog.comments-submit", "Publicar comentario")}
                    </span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                  ...
                </div>
              ) : comments.length === 0 ? (
                <div
                  className="card-premium"
                  style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}
                >
                  <MessageCircle size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    {t("blog.comments-empty", "Sé la primera persona en dejar un comentario.")}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {comments.map((comment) => {
                    const initial = (comment.author_name || "A").trim().charAt(0).toUpperCase();
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-premium"
                        style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start' }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                              {comment.author_name}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {comment.content}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
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
        
        <div className="projects-header" style={{ position: 'relative', paddingTop: '0rem', marginBottom: '2.5rem' }}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}
          >
            <div className="brand-lockup">
              <span className="brand-name">
                <FileText size={13} /> EDITORIAL
              </span>
              <span className="brand-context">
                {posts.length} {t("blog.title", "Publicaciones")}
              </span>
            </div>
          </motion.div>

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
            style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'clamp(1rem, 1.45vw, 1.2rem)', lineHeight: 1.7 }}
          >
            {t("blog.subtitle")}
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            maxWidth: '560px',
            margin: '0 auto 1.25rem',
            position: 'relative',
            borderRadius: '999px',
            border: '1px solid var(--color-border-strong)',
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-pill)',
            padding: '0.25rem',
          }}
        >
          <Search size={17} aria-hidden="true" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('blog.search-placeholder')}
            aria-label={t('blog.search-label')}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem 0.75rem 2.85rem',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.45rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem',
            padding: '0.45rem',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            width: 'fit-content',
            maxWidth: '100%',
            marginInline: 'auto',
            boxShadow: 'var(--shadow-pill)',
          }}
        >
          {[
            { id: "all", label: t("blog.filter-all"), icon: <Filter size={13} /> },
            { id: "poem", label: t("blog.filter-poems"), icon: <FileText size={13} /> },
            { id: "letter", label: t("blog.filter-letters"), icon: <Mail size={13} /> },
            { id: "article", label: t("blog.filter-articles"), icon: <FileText size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`project-tag ${filter === tab.id ? 'active' : ''}`}
              style={{ 
                cursor: 'pointer',
                padding: '0.5rem 1.05rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                background: filter === tab.id ? 'var(--color-text)' : 'transparent',
                color: filter === tab.id ? 'var(--color-bg)' : 'var(--color-text-muted)'
              }}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', 
              gap: '1.5rem',
              maxWidth: '1180px', 
              margin: '0 auto',
              alignItems: 'stretch'
            }}
          >
            {filteredPosts.map((post, index) => {
              const cardVariants = {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: index * 0.05 } }
              };
              const typeLabel = post.type === "poem" ? t("blog.type-poem") : post.type === "letter" ? t("blog.type-letter") : t("blog.type-article");

              return (
                  <motion.article
                    key={post.id}
                    variants={cardVariants}
                    className="card-premium h-full"
                    style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    {post.image_url && (
                      <div style={{ width: '100%', height: '210px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
                        <ProtectedImage
                          src={getImageUrl(post.image_url)}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                      <div className="ecosystem-card-top" style={{ marginBottom: '1.1rem' }}>
                        <span className="ecosystem-icon" style={{ width: '38px', height: '38px' }}>
                          <FileText size={16} />
                        </span>
                        <span className="ecosystem-kicker">
                          {typeLabel} · {formatDate(post.created_at)}
                        </span>
                      </div>

                      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 400, color: 'var(--color-text)', marginBottom: '0.85rem', lineHeight: 1.05, wordBreak: 'break-word' }}>
                        {post.title}
                      </h2>

                      <div style={{ marginBottom: '1.75rem', flex: 1 }}>
                        <div style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', fontWeight: 400, display: '-webkit-box', WebkitLineClamp: post.image_url ? 3 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content ? post.content.trim() : ''}
                        </div>
                      </div>

                      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                          MÉXICO
                        </span>
                        <button onClick={() => openPost(post.id)} className="ecosystem-cta" style={{ cursor: 'pointer' }}>
                          {t("blog.read-more")} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '4rem 2rem' }} className="card-premium">
            <FileText size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-text-muted)' }} />
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
              {normalizedSearch ? t('blog.no-search-results') : filter === "all" ? t("blog.no-posts") : t("blog.no-posts-filter")}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default withProviders(BlogPage);
