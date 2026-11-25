import withProviders from '../components/withProviders.jsx';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { api } from "../services/api.js";
import { API_CONFIG } from "../config/api.js";
import blogFallback from "../data/blogFallback.js";
import ProtectedImage from "../components/ProtectedImage.jsx";
import BlogPostSkeleton from "../components/BlogPostSkeleton.jsx";
import { validateComment, checkCommentCooldown, recordCommentTimestamp } from "../utils/commentModeration.js";
import { localizeBlogPost } from "../utils/blogLocalization.js";
import {
  FileText,
  Heart,
  Eye,
  ArrowLeft,
  ArrowRight,
  Search,
  MessageCircle,
  Send,
  Share2,
  Check,
  X,
} from "lucide-react";

const INITIAL_BLOG_POSTS = [...blogFallback]
  .filter((post) => post.status === "published")
  .map((post) => ({
    ...post,
    likes_count: parseInt(post.likes_count) || 0,
    views_count: parseInt(post.views_count) || 0,
  }))
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState(INITIAL_BLOG_POSTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'article' | 'letter' | 'poem'
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'top'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentHoneypot, setCommentHoneypot] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState(null);

  // Read URL query parameter for routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get("post");
    if (postParam) {
      setSelectedPostId(postParam);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      setSelectedPostId(currentParams.get("post"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openPost = (id) => {
    setSelectedPostId(id);
    window.history.pushState({}, "", `?post=${id}`);
    window.scrollTo(0, 0);
  };

  const closePost = () => {
    setSelectedPostId(null);
    window.history.pushState({}, "", window.location.pathname);
    window.scrollTo(0, 0);
  };

  const handleSharePost = async (e, post) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if user cancels or share fails
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const getCookie = useCallback((name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }, []);

  const setCookie = useCallback((name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }, []);

  const hasViewedPost = useCallback(
    (postId) => {
      const numericId = Number(postId);
      const cookieName = `blog_viewed_${numericId}`;
      const cookieValue = getCookie(cookieName);
      if (cookieValue === "true") {
        return true;
      }
      return viewedPosts.has(numericId) || viewedPosts.has(postId);
    },
    [getCookie, viewedPosts]
  );

  const markPostAsViewed = useCallback(
    (postId) => {
      const numericId = Number(postId);
      const cookieName = `blog_viewed_${numericId}`;
      setCookie(cookieName, "true", 365);
      setViewedPosts((prev) => new Set([...prev, numericId]));
    },
    [setCookie]
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/placeholder-project.webp";
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl = API_CONFIG.getBaseURL();
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;

    if (cleanPath.startsWith("uploads/")) {
      return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/uploads/images/${cleanPath}`;
  };

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const result = await api.blog.getAll(null, "published");

      if (result.success) {
        let postsData = [];

        if (Array.isArray(result.data)) {
          postsData = result.data;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          postsData = result.data.data;
        }

        if (postsData.length > 0) {
          postsData = postsData.map((post) => ({
            ...post,
            likes_count: parseInt(post.likes_count) || 0,
            views_count: parseInt(post.views_count) || 0,
          }));

          setPosts(postsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
        setError(null);
      }
    } catch {
      // Keep INITIAL_BLOG_POSTS rendered seamlessly if network fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const viewedFromCookies = new Set();
      posts.forEach((post) => {
        if (post && post.id) {
          const cookieName = `blog_viewed_${post.id}`;
          const cookieValue = getCookie(cookieName);
          if (cookieValue === "true") {
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
      } catch (err) {
        console.error("Blog operation failed:", err);
      }

      if (!hasViewedPost(selectedPostId)) {
        try {
          const result = await api.blog.trackView(selectedPostId);
          if (result.success && result.data) {
            const apiData = result.data.data || result.data;
            if (apiData?.view_recorded !== false) {
              markPostAsViewed(selectedPostId);
              if (apiData?.views_count !== undefined) {
                setPosts((prevPosts) =>
                  prevPosts.map((p) =>
                    p.id == selectedPostId ? { ...p, views_count: parseInt(apiData.views_count) || 0 } : p
                  )
                );
              }
            }
          }
        } catch (err) {
          console.error("Blog operation failed:", err);
        }
      }

      try {
        setLoadingComments(true);
        const commentsResult = await api.blog.getComments(selectedPostId);
        if (commentsResult.success && Array.isArray(commentsResult.data)) {
          setComments(commentsResult.data);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
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

    if (commentHoneypot && commentHoneypot.trim().length > 0) {
      setCommentContent("");
      setCommentFeedback({ type: "success", text: t("blog.comments-success") });
      return;
    }

    const cooldown = checkCommentCooldown();
    if (!cooldown.allowed) {
      setCommentFeedback({
        type: "error",
        text: t("blog.comments-error-cooldown", { seconds: cooldown.remainingSeconds }),
      });
      return;
    }

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

  const handleLike = async (postId, e) => {
    if (e) e.stopPropagation();
    if (likingPosts.has(postId)) return;

    try {
      setLikingPosts((prev) => new Set(prev).add(postId));
      const result = await api.blog.like(postId);

      if (result.success && result.data) {
        const apiData = result.data.data || result.data;
        const { liked, likes_count } = apiData || {};

        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (liked === true) newSet.add(postId);
          else if (liked === false) newSet.delete(postId);
          return newSet;
        });

        if (likes_count !== undefined) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, likes_count: parseInt(likes_count) || 0 } : post
            )
          );
        }
      }
    } catch (err) {
      console.error("[Like Button] Error liking post:", err);
    } finally {
      setLikingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const toIsoDate = (dateString) => {
    if (!dateString) return undefined;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const isEn = String(i18n.language || "es").toLowerCase().startsWith("en");
    const locale = isEn ? "en-US" : "es-ES";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const isEn = String(i18n.language || "es").toLowerCase().startsWith("en");
    const locale = isEn ? "en-US" : "es-ES";
    return date
      .toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      })
      .replace(".", "")
      .toUpperCase();
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const isEn = String(i18n.language || "es").toLowerCase().startsWith("en");
    const locale = isEn ? "en-US" : "es-ES";
    return date
      .toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  };

  const getTypeLabel = (type) => {
    if (type === "poem") return t("blog.type-poem");
    if (type === "letter") return t("blog.type-letter");
    return t("blog.type-article");
  };

  const getExcerpt = (content) => {
    if (!content) return "";
    return content.replace(/\s+/g, " ").trim();
  };

  // Localize all posts dynamically to Spanish or English
  const localizedPosts = useMemo(
    () => posts.map((post) => localizeBlogPost(post, i18n.language)),
    [posts, i18n.language]
  );

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  // Filter posts by category & search query
  const categoryFilteredPosts = useMemo(() => {
    const byCategory =
      filter === "all" ? localizedPosts : localizedPosts.filter((p) => p.type === filter);
    if (!normalizedSearch) return byCategory;
    return byCategory.filter((post) =>
      `${post.title || ""} ${post.content || ""}`
        .toLocaleLowerCase()
        .includes(normalizedSearch)
    );
  }, [localizedPosts, filter, normalizedSearch]);

  const showNewspaperHero =
    filter === "all" && !isArchiveView && !normalizedSearch && localizedPosts.length >= 3;

  // Hero / Left / Right newspaper selection for the main homepage view
  const { heroPost, leftColumnPosts, mostPopularPosts, feedPosts } = useMemo(() => {
    const allSortedByDate = [...localizedPosts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    // Prefer the newest post that has an image as the central newspaper cover story
    const featured =
      allSortedByDate.find((p) => Boolean(p.image_url)) || allSortedByDate[0] || null;
    const remainingByDate = featured
      ? allSortedByDate.filter((p) => p.id !== featured.id)
      : allSortedByDate;

    // Prefer posts with images for the 2 left-column visual story cards if available
    const withImages = remainingByDate.filter((p) => Boolean(p.image_url));
    const withoutImages = remainingByDate.filter((p) => !p.image_url);
    const leftStories = [...withImages, ...withoutImages].slice(0, 2);

    const heroShownIds = new Set(
      [featured?.id, ...leftStories.map((p) => p.id)].filter(Boolean)
    );

    // Most Popular sidebar: sorted by engagement (likes + views)
    const popular = [...localizedPosts]
      .sort(
        (a, b) =>
          (b.likes_count || 0) * 4 +
          (b.views_count || 0) -
          ((a.likes_count || 0) * 4 + (a.views_count || 0))
      )
      .slice(0, 5);

    // Feed list (sorted by latest or top; avoid repeating top 3 hero stories on main latest view)
    const baseFeedSource =
      showNewspaperHero && sortBy === "latest"
        ? categoryFilteredPosts.filter((p) => !heroShownIds.has(p.id))
        : categoryFilteredPosts;

    const listSource = [...baseFeedSource].sort((a, b) => {
      if (sortBy === "top") {
        return (
          (b.likes_count || 0) * 4 +
          (b.views_count || 0) -
          ((a.likes_count || 0) * 4 + (a.views_count || 0))
        );
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return {
      heroPost: featured,
      leftColumnPosts: leftStories,
      mostPopularPosts: popular,
      feedPosts: listSource,
    };
  }, [localizedPosts, categoryFilteredPosts, sortBy, showNewspaperHero]);

  // Group feed posts by Month + Year when viewing archive or sorted by latest
  const groupedFeedPosts = useMemo(() => {
    const groups = [];
    for (const post of feedPosts) {
      const label = sortBy === "latest" ? formatMonthYear(post.created_at) : null;
      if (!groups.length || groups[groups.length - 1].label !== label) {
        groups.push({ label, items: [post] });
      } else {
        groups[groups.length - 1].items.push(post);
      }
    }
    return groups;
  }, [feedPosts, sortBy, i18n.language]);

  const renderEngagementRow = (post, centered = false) => {
    const isLiked = likedPosts.has(post.id);
    const isCopied = copiedPostId === post.id;
    return (
      <div
        className="substack-engagement-bar"
        style={{ justifyContent: centered ? "center" : "flex-start" }}
      >
        <button
          type="button"
          onClick={(e) => handleLike(post.id, e)}
          disabled={likingPosts.has(post.id)}
          className={`substack-action-pill ${isLiked ? "active" : ""}`}
          aria-label={`${t("blog.like")} (${post.likes_count || 0})`}
        >
          <Heart size={13} className={isLiked ? "fill-current" : ""} />
          <span>{post.likes_count || 0}</span>
        </button>

        <button
          type="button"
          onClick={() => openPost(post.id)}
          className="substack-action-pill"
          aria-label={`${t("blog.comments-title")}`}
        >
          <MessageCircle size={13} />
          {post.views_count > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Eye size={12} /> {post.views_count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => handleSharePost(e, post)}
          className="substack-action-pill"
          aria-label={t("blog.share", "Compartir")}
        >
          {isCopied ? <Check size={13} /> : <Share2 size={13} />}
          {isCopied && <span>{t("blog.copied-link", "Copiado")}</span>}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="projects-section" style={{ minHeight: "100svh" }}>
        <div className="substack-shell" style={{ paddingTop: "2rem" }}>
          <BlogPostSkeleton />
          <div style={{ marginTop: "2rem" }}>
            <BlogPostSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="projects-section" style={{ minHeight: "100svh", display: "grid", placeItems: "center" }}>
        <div className="substack-shell" style={{ textAlign: "center", color: "#ef4444" }}>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // ============================================================================
  // INDIVIDUAL POST READER VIEW (Substack Article Layout)
  // ============================================================================
  if (selectedPostId) {
    const selectedPost = localizedPosts.find((p) => p.id == selectedPostId);
    if (selectedPost) {
      const wordCount = selectedPost.content
        ? selectedPost.content.trim().split(/\s+/).length
        : 0;
      const readingTimeMin = Math.max(1, Math.ceil(wordCount / 225));
      const isLiked = likedPosts.has(selectedPost.id);
      const isCopied = copiedPostId === selectedPost.id;

      return (
        <section className="projects-section" style={{ minHeight: "100svh", paddingTop: "1rem" }}>
          <article
            className="substack-shell"
            style={{ maxInlineSize: "740px", marginInline: "auto", paddingBottom: "4rem" }}
          >
            {/* Minimalist Top Publication Bar */}
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                paddingBlockEnd: "1rem",
                marginBlockEnd: "2rem",
                borderBlockEnd: "1px solid var(--color-border)",
              }}
            >
              <button
                type="button"
                onClick={closePost}
                className="substack-action-pill"
                style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}
              >
                <ArrowLeft size={14} />
                <span>{t("blog.back", "Volver")}</span>
              </button>

              <span
                style={{
                  fontFamily: "var(--font-editorial-serif)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                {t("blog.title")}
              </span>
            </header>

            {/* Article Header */}
            <div style={{ marginBlockEnd: "2rem" }}>
              <div className="substack-kicker" style={{ marginBlockEnd: "0.75rem" }}>
                {getTypeLabel(selectedPost.type)}
              </div>

              <h1
                className="substack-serif-title"
                style={{
                  fontSize: "clamp(1.85rem, 4.8vw, 3rem)",
                  lineHeight: 1.15,
                  marginBlockEnd: "1.5rem",
                  wordBreak: "break-word",
                }}
              >
                {selectedPost.title}
              </h1>

              {/* Substack Author Byline & Engagement Toolbar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  paddingBlock: "0.95rem",
                  borderBlock: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      inlineSize: "40px",
                      blockSize: "40px",
                      borderRadius: "50%",
                      background: "var(--color-text)",
                      color: "var(--color-bg)",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-editorial-serif)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    I
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--color-text)",
                      }}
                    >
                      {t("blog.author-byline", "Imanol Pérez Arteaga")}
                    </div>
                    <div className="substack-meta" style={{ marginTop: "0.15rem" }}>
                      <time dateTime={toIsoDate(selectedPost.created_at)}>
                        {formatDate(selectedPost.created_at)}
                      </time>
                      <span>·</span>
                      <span>
                        {readingTimeMin} {t("blog.reading-time", "min read")}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    disabled={likingPosts.has(selectedPost.id)}
                    className={`substack-action-pill ${isLiked ? "active" : ""}`}
                    style={{ padding: "0.4rem 0.85rem" }}
                  >
                    <Heart size={15} className={isLiked ? "fill-current" : ""} />
                    <span>{selectedPost.likes_count || 0}</span>
                  </button>

                  <a
                    href="#comments-section"
                    className="substack-action-pill"
                    style={{ padding: "0.4rem 0.85rem", textDecoration: "none" }}
                  >
                    <MessageCircle size={15} />
                    <span>{comments.length}</span>
                  </a>

                  {selectedPost.views_count > 0 && (
                    <span className="substack-action-pill" style={{ padding: "0.4rem 0.85rem", cursor: "default" }}>
                      <Eye size={15} />
                      <span>{selectedPost.views_count}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleSharePost(e, selectedPost)}
                    className="substack-action-pill"
                    style={{ padding: "0.4rem 0.85rem" }}
                  >
                    {isCopied ? <Check size={15} /> : <Share2 size={15} />}
                    <span>{isCopied ? t("blog.copied-link", "Copiado") : t("blog.share", "Compartir")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Article Image */}
            {selectedPost.image_url && (
              <figure
                className="substack-hero-media"
                style={{ margin: "0 0 2.25rem", maxBlockSize: "460px" }}
              >
                <ProtectedImage
                  src={getImageUrl(selectedPost.image_url)}
                  alt={selectedPost.title}
                  priority
                />
              </figure>
            )}

            {/* Editorial Reading Body */}
            <div className="blog-content-premium">
              {selectedPost.content ? selectedPost.content.trim() : ""}
            </div>

            {/* Bottom Article Interaction Bar */}
            <div
              style={{
                paddingBlock: "1.25rem",
                borderBlock: "1px solid var(--color-border)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={(e) => handleLike(selectedPost.id, e)}
                  disabled={likingPosts.has(selectedPost.id)}
                  className={`substack-action-pill ${isLiked ? "active" : ""}`}
                  style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}
                >
                  <Heart size={16} className={isLiked ? "fill-current" : ""} />
                  <span>
                    {selectedPost.likes_count || 0} {t("blog.likes", "Me gusta")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSharePost(e, selectedPost)}
                  className="substack-action-pill"
                  style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}
                >
                  {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                  <span>{isCopied ? t("blog.copied-link", "Copiado") : t("blog.share", "Compartir")}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={closePost}
                className="substack-action-pill"
                style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}
              >
                <ArrowLeft size={15} />
                <span>{t("blog.see-all", "Ver todas las publicaciones")}</span>
              </button>
            </div>

            {/* --- COMMENTS SECTION --- */}
            <section id="comments-section" style={{ marginBlockStart: "3rem", scrollMarginTop: "6.5rem" }}>
              <div style={{ marginBlockEnd: "1.5rem" }}>
                <h2
                  className="substack-serif-title"
                  style={{ fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <span>{t("blog.comments-title", "Comentarios")}</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 400, color: "var(--color-text-muted)" }}>
                    ({comments.length})
                  </span>
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", marginBlock: "0.35rem 0" }}>
                  {t("blog.comments-subtitle", "Comparte tus pensamientos sobre esta publicación")}
                </p>
              </div>

              {/* Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  marginBlockEnd: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.1rem",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    opacity: 0,
                    pointerEvents: "none",
                    height: 0,
                    overflow: "hidden",
                  }}
                >
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
                  <label
                    htmlFor="comment-author"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--color-text)",
                      marginBlockEnd: "0.4rem",
                    }}
                  >
                    {t("blog.comments-name-label", "Tu nombre o alias")} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="comment-author"
                    name="author"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={60}
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder={t("blog.comments-name-placeholder", "Ej. Ana, Lector anónimo...")}
                    style={{
                      inlineSize: "100%",
                      minBlockSize: "48px",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border-strong)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      font: "inherit",
                      fontSize: "max(1rem, 1em)",
                    }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBlockEnd: "0.4rem",
                    }}
                  >
                    <label
                      htmlFor="comment-content"
                      style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text)" }}
                    >
                      {t("blog.comments-content-label", "Tu comentario")} <span aria-hidden="true">*</span>
                    </label>
                    <span id="comment-char-count" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {commentContent.length}/500
                    </span>
                  </div>
                  <textarea
                    id="comment-content"
                    name="comment"
                    required
                    rows={3}
                    maxLength={500}
                    aria-describedby="comment-char-count"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={t("blog.comments-content-placeholder", "Escribe un mensaje respetuoso...")}
                    style={{
                      inlineSize: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border-strong)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      font: "inherit",
                      fontSize: "max(1rem, 1em)",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div role="status" aria-live="polite">
                  {commentFeedback && (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg)",
                        color: commentFeedback.type === "error" ? "#ef4444" : "var(--color-text)",
                      }}
                    >
                      {commentFeedback.text}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="btn-premium btn-premium-solid"
                    style={{
                      padding: "0.7rem 1.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      minBlockSize: "44px",
                    }}
                  >
                    <Send size={15} />
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
                <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-muted)" }}>
                  ...
                </div>
              ) : comments.length === 0 ? (
                <div
                  style={{
                    padding: "2rem 1.5rem",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.92rem" }}>
                    {t("blog.comments-empty", "Sé la primera persona en dejar un comentario.")}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {comments.map((comment) => {
                    const initial = (comment.author_name || "A").trim().charAt(0).toUpperCase();
                    return (
                      <div
                        key={comment.id}
                        style={{
                          paddingBlock: "1.25rem",
                          borderBlockStart: "1px solid var(--color-border)",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr",
                          gap: "0.9rem",
                          alignItems: "start",
                        }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            inlineSize: "2.25rem",
                            blockSize: "2.25rem",
                            borderRadius: "50%",
                            background: "var(--color-faint)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text)",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "baseline",
                              gap: "0.5rem",
                              marginBlockEnd: "0.35rem",
                            }}
                          >
                            <strong style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>
                              {comment.author_name}
                            </strong>
                            <time
                              dateTime={toIsoDate(comment.created_at)}
                              style={{ fontSize: "0.76rem", color: "var(--color-text-muted)" }}
                            >
                              {formatDate(comment.created_at)}
                            </time>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.95rem",
                              color: "var(--color-text)",
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </article>
        </section>
      );
    }
  }

  // ============================================================================
  // SUBSTACK NEWSPAPER / MAGAZINE HOME & ARCHIVE VIEW
  // ============================================================================
  const hasArticles = posts.some((p) => p.type === "article");
  const navTabs = [
    { id: "home", label: t("blog.filter-all", "Todos"), filterValue: "all", archive: false },
    ...(hasArticles
      ? [{ id: "article", label: t("blog.filter-articles", "Artículos"), filterValue: "article", archive: false }]
      : []),
    { id: "letter", label: t("blog.filter-letters", "Cartas"), filterValue: "letter", archive: false },
    { id: "poem", label: t("blog.filter-poems", "Poemas"), filterValue: "poem", archive: false },
    { id: "archive", label: t("blog.archive", "Archivo"), filterValue: "all", archive: true },
  ];

  const activeTabId = isArchiveView ? "archive" : filter === "all" ? "home" : filter;

  const availableSections = [
    ...(hasArticles ? [{ id: "article", title: t("blog.filter-articles", "Artículos") }] : []),
    { id: "letter", title: t("blog.filter-letters", "Cartas") },
    { id: "poem", title: t("blog.filter-poems", "Poemas") },
  ];

  return (
    <section className="projects-section" style={{ minHeight: "100svh", paddingTop: "0.75rem" }}>
      <div className="substack-shell">
        {/* 1. Top Publication Masthead */}
        <header className="substack-masthead">
          <h1 className="substack-pub-title">{t("blog.title")}</h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.92rem",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {t("blog.subtitle")}
          </p>
        </header>

        {/* 2. Substack Navigation Tabs Bar */}
        <nav className="substack-nav-bar" aria-label={t("blog.sections-title", "Secciones")}>
          <ul className="substack-nav-tabs">
            {navTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFilter(tab.filterValue);
                    setIsArchiveView(tab.archive);
                  }}
                  className={`substack-tab-btn ${activeTabId === tab.id ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="substack-action-pill substack-nav-search-btn"
            aria-expanded={searchOpen}
            aria-controls="blog-search-region"
            aria-label={t("blog.search-label")}
            style={{ padding: "0.4rem 0.65rem", flexShrink: 0 }}
          >
            {searchOpen ? <X size={15} /> : <Search size={15} />}
          </button>
        </nav>

        {/* Expandable Semantic <search> Region */}
        <AnimatePresence>
          {(searchOpen || normalizedSearch) && (
            <motion.div
              id="blog-search-region"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ maxInlineSize: "640px", marginInline: "auto", marginBlockEnd: "2.25rem" }}
            >
              <search>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "999px",
                    border: "1px solid var(--color-border-strong)",
                    background: "var(--color-surface)",
                    padding: "0.2rem 0.75rem",
                  }}
                >
                  <Search size={16} aria-hidden="true" style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t("blog.search-placeholder")}
                    aria-label={t("blog.search-label")}
                    autoFocus
                    style={{
                      inlineSize: "100%",
                      minBlockSize: "42px",
                      padding: "0.45rem 0.75rem",
                      border: "none",
                      background: "transparent",
                      color: "var(--color-text)",
                      font: "inherit",
                      fontSize: "max(1rem, 1em)",
                      outline: "none",
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="substack-action-pill"
                      style={{ border: "none", padding: "0.25rem" }}
                      aria-label={t("blog.clear-search", "Limpiar búsqueda")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </search>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Above-the-Fold 3-Column Newspaper Hero Grid */}
        {showNewspaperHero && heroPost && (
          <div className="substack-hero-grid">
            {/* LEFT COLUMN (~25%): Stacked Secondary Stories */}
            <div className="substack-hero-left" style={{ display: "flex", flexDirection: "column", gap: "1.85rem" }}>
              {leftColumnPosts.map((post, idx) => (
                <article
                  key={post.id}
                  style={{
                    paddingBlockEnd: idx === 0 && leftColumnPosts.length > 1 ? "1.5rem" : 0,
                    borderBlockEnd:
                      idx === 0 && leftColumnPosts.length > 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <a
                    href={`?post=${post.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openPost(post.id);
                    }}
                    className="substack-story-trigger"
                  >
                    {post.image_url && (
                      <div className="substack-card-media">
                        <ProtectedImage
                          src={getImageUrl(post.image_url)}
                          alt={post.title}
                        />
                      </div>
                    )}

                    <div className="substack-kicker" style={{ marginBlockEnd: "0.3rem" }}>
                      {getTypeLabel(post.type)}
                    </div>

                    <h2
                      className="substack-serif-title"
                      style={{ fontSize: "1.2rem", marginBlockEnd: "0.4rem" }}
                    >
                      {post.title}
                    </h2>

                    <p
                      className="substack-clamp-2"
                      style={{
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        color: "var(--color-text-muted)",
                        margin: "0 0 0.55rem",
                      }}
                    >
                      {getExcerpt(post.content)}
                    </p>
                  </a>

                  <div className="substack-meta">
                    <time dateTime={toIsoDate(post.created_at)}>
                      {formatShortDate(post.created_at)}
                    </time>
                    <span>·</span>
                    <span>IMANOL</span>
                  </div>
                </article>
              ))}
            </div>

            {/* CENTER COLUMN (~50%): Featured Hero Cover Story */}
            <article className="substack-hero-center" style={{ textAlign: "center" }}>
              <a
                href={`?post=${heroPost.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  openPost(heroPost.id);
                }}
                className="substack-story-trigger"
                style={{ textAlign: "center" }}
              >
                {heroPost.image_url && (
                  <div className="substack-hero-media">
                    <ProtectedImage
                      src={getImageUrl(heroPost.image_url)}
                      alt={heroPost.title}
                      priority
                    />
                  </div>
                )}

                <div className="substack-kicker" style={{ marginBlockEnd: "0.5rem" }}>
                  {getTypeLabel(heroPost.type)}
                </div>

                <h2
                  className="substack-serif-title"
                  style={{
                    fontSize: "clamp(1.75rem, 3.2vw, 2.4rem)",
                    marginBlockEnd: "0.75rem",
                    maxInlineSize: "24ch",
                    marginInline: "auto",
                  }}
                >
                  {heroPost.title}
                </h2>

                <p
                  className="substack-clamp-3"
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    color: "var(--color-text-muted)",
                    maxInlineSize: "52ch",
                    margin: "0 auto 0.85rem",
                  }}
                >
                  {getExcerpt(heroPost.content)}
                </p>
              </a>

              <div className="substack-meta" style={{ justifyContent: "center" }}>
                <time dateTime={toIsoDate(heroPost.created_at)}>
                  {formatShortDate(heroPost.created_at)}
                </time>
                <span>·</span>
                <span>IMANOL</span>
              </div>

              {renderEngagementRow(heroPost, true)}
            </article>

            {/* RIGHT COLUMN (~25%): "Most Popular" Sidebar */}
            <aside className="substack-hero-sidebar-right" aria-label={t("blog.most-popular", "Más populares")}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginBlockEnd: "1rem",
                  paddingBlockEnd: "0.6rem",
                  borderBlockEnd: "1px solid var(--color-border)",
                }}
              >
                <h2 className="substack-serif-title" style={{ fontSize: "1.15rem" }}>
                  {t("blog.most-popular", "Más populares")}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("top");
                    setIsArchiveView(true);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                  }}
                >
                  {t("blog.view-all", "Ver todo")}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {mostPopularPosts.map((post, idx) => (
                  <article
                    key={post.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.85rem",
                      paddingBlock: "0.85rem",
                      borderBlockEnd:
                        idx < mostPopularPosts.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                    }}
                  >
                    <div style={{ flex: "1 1 auto", minInlineSize: 0 }}>
                      <a
                        href={`?post=${post.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openPost(post.id);
                        }}
                        className="substack-story-trigger"
                      >
                        <h3
                          className="substack-serif-title substack-clamp-2"
                          style={{ fontSize: "0.96rem", marginBlockEnd: "0.3rem" }}
                        >
                          {post.title}
                        </h3>
                      </a>
                      <div className="substack-meta">
                        <time dateTime={toIsoDate(post.created_at)}>
                          {formatShortDate(post.created_at)}
                        </time>
                        <span>·</span>
                        <span>IMANOL</span>
                      </div>
                    </div>

                    {post.image_url && (
                      <a
                        href={`?post=${post.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openPost(post.id);
                        }}
                        aria-label={post.title}
                        className="substack-popular-thumb"
                      >
                        <ProtectedImage
                          src={getImageUrl(post.image_url)}
                          alt={post.title}
                        />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </aside>
          </div>
        )}

        {/* 4. Lower Section: 2-Column Editorial Feed / Archive */}
        <div
          className={showNewspaperHero ? "substack-feed-layout" : ""}
          style={
            !showNewspaperHero
              ? { maxInlineSize: "760px", marginInline: "auto" }
              : undefined
          }
        >
          {/* Left Publication Directory Column (visible on main newspaper view) */}
          {showNewspaperHero && (
            <aside className="substack-feed-sidebar">
              <h2
                className="substack-serif-title"
                style={{
                  fontSize: "1.2rem",
                  paddingBlockEnd: "0.65rem",
                  marginBlockEnd: "1rem",
                  borderBlockEnd: "1px solid var(--color-border)",
                }}
              >
                {t("blog.sections-title", "Secciones")}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBlockEnd: "2rem" }}>
                {availableSections.map((sec) => {
                  const count = posts.filter((p) => p.type === sec.id).length;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        setFilter(sec.id);
                        setIsArchiveView(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="substack-story-trigger"
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        paddingBlockEnd: "0.75rem",
                        borderBlockEnd: "1px solid var(--color-border)",
                      }}
                    >
                      <span className="substack-serif-title" style={{ fontSize: "1.05rem" }}>
                        {sec.title}
                      </span>
                      <span className="substack-meta">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                <h3 className="substack-serif-title" style={{ fontSize: "1.25rem", marginBlockEnd: "0.5rem" }}>
                  {t("blog.title")}
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--color-text-muted)", margin: 0 }}>
                  {t("blog.sections-desc")}
                </p>
              </div>
            </aside>
          )}

          {/* Right / Main Chronological Feed Column */}
          <div className="substack-feed-main">
            {/* Feed Header with Segmented [Latest | Top] Control */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                paddingBlockEnd: "0.85rem",
                borderBlockEnd: "1px solid var(--color-border)",
              }}
            >
              <h2 className="substack-serif-title" style={{ fontSize: "1.35rem" }}>
                {isArchiveView
                  ? t("blog.archive", "Archivo")
                  : filter === "all"
                  ? t("blog.recent-posts", "Publicaciones recientes")
                  : navTabs.find((tab) => tab.id === filter)?.label}
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="substack-segmented" role="group" aria-label={t("blog.sort-aria", "Ordenar publicaciones")}>
                  <button
                    type="button"
                    onClick={() => setSortBy("latest")}
                    className={`substack-segmented-btn ${sortBy === "latest" ? "active" : ""}`}
                  >
                    {t("blog.sort-latest", "Recientes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("top")}
                    className={`substack-segmented-btn ${sortBy === "top" ? "active" : ""}`}
                  >
                    {t("blog.sort-top", "Populares")}
                  </button>
                </div>
              </div>
            </div>

            {/* Feed Items Grouped by Month/Year */}
            {feedPosts.length > 0 ? (
              <div>
                {groupedFeedPosts.map((group, groupIdx) => (
                  <div key={group.label || `group-${groupIdx}`}>
                    {group.label && <h3 className="substack-month-header">{group.label}</h3>}

                    {group.items.map((post) => (
                      <article key={post.id} className="substack-row-card">
                        <div className="substack-row-body">
                          <a
                            href={`?post=${post.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              openPost(post.id);
                            }}
                            className="substack-story-trigger"
                          >
                            <div className="substack-kicker" style={{ marginBlockEnd: "0.3rem" }}>
                              {getTypeLabel(post.type)}
                            </div>

                            <h3
                              className="substack-serif-title"
                              style={{
                                fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
                                marginBlockEnd: "0.4rem",
                              }}
                            >
                              {post.title}
                            </h3>

                            <p
                              className="substack-clamp-2"
                              style={{
                                fontSize: "0.94rem",
                                lineHeight: 1.55,
                                color: "var(--color-text-muted)",
                                margin: "0 0 0.65rem",
                              }}
                            >
                              {getExcerpt(post.content)}
                            </p>
                          </a>

                          <div className="substack-meta">
                            <time dateTime={toIsoDate(post.created_at)}>
                              {formatShortDate(post.created_at)}
                            </time>
                            <span>·</span>
                            <span>IMANOL</span>
                          </div>

                          {renderEngagementRow(post, false)}
                        </div>

                        {post.image_url && (
                          <a
                            href={`?post=${post.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              openPost(post.id);
                            }}
                            className="substack-row-thumb"
                            aria-label={post.title}
                          >
                            <ProtectedImage
                              src={getImageUrl(post.image_url)}
                              alt={post.title}
                            />
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                ))}

                {!isArchiveView && (
                  <div style={{ marginBlockStart: "2rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsArchiveView(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="substack-action-pill"
                      style={{ padding: "0.65rem 1.35rem", fontSize: "0.85rem", fontWeight: 600 }}
                    >
                      <span>{t("blog.see-all", "Ver todas las publicaciones")}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: "var(--color-text-muted)" }}>
                <FileText size={38} style={{ margin: "0 auto 1rem", opacity: 0.6 }} />
                <p style={{ fontSize: "1rem", margin: 0 }}>
                  {normalizedSearch
                    ? t("blog.no-search-results")
                    : filter === "all"
                    ? t("blog.no-posts")
                    : t("blog.no-posts-filter")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default withProviders(BlogPage);
