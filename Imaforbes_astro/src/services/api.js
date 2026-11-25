import { supabase } from './supabase.js';
import blogFallback from '../data/blogFallback.js';
import experienceFallback from '../data/experienceFallback.js';

/**
 * Standardizes API error responses.
 * @param {Error|any} error - The caught error object
 * @param {string} [fallbackMessage='An error occurred'] - Default message if error has none
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
    if (typeof error === 'string') {
        return { type: 'UNKNOWN', message: error };
    }
    return { type: 'UNKNOWN', message: error?.message || fallbackMessage };
};

const CONTACT_RATE_LIMIT_KEY = 'imaforbes_contact_timestamps';
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const CONTACT_MAX_ATTEMPTS = 3;

const checkContactRateLimit = () => {
    if (typeof window === 'undefined') return { allowed: true };
    try {
        const now = Date.now();
        const raw = JSON.parse(localStorage.getItem(CONTACT_RATE_LIMIT_KEY) || '[]');
        const recent = Array.isArray(raw) ? raw.filter(ts => now - Number(ts) < CONTACT_WINDOW_MS) : [];
        if (recent.length >= CONTACT_MAX_ATTEMPTS) {
            const retryMinutes = Math.max(1, Math.ceil((CONTACT_WINDOW_MS - (now - recent[0])) / 60000));
            return {
                allowed: false,
                error: `Has alcanzado el límite de mensajes (máx. ${CONTACT_MAX_ATTEMPTS} cada 10 min). Intenta de nuevo en ${retryMinutes} min.`
            };
        }
        return { allowed: true, recent };
    } catch {
        return { allowed: true, recent: [] };
    }
};

const recordContactAttempt = (recent = []) => {
    if (typeof window === 'undefined') return;
    try {
        const updated = [...recent, Date.now()].slice(-CONTACT_MAX_ATTEMPTS);
        localStorage.setItem(CONTACT_RATE_LIMIT_KEY, JSON.stringify(updated));
    } catch {
        // ignore storage errors
    }
};

const normalizeExperienceRecord = (exp) => {
    if (!exp || typeof exp !== 'object') return exp;
    return {
        ...exp,
        title: String(exp.title || '').replace(/Enginner/gi, 'Engineer'),
        description: String(exp.description || '').replace(/Your key contributions/g, 'Key contributions')
    };
};

/**
 * Centralized API client interacting with Supabase Backend-as-a-Service (BaaS).
 * Equipped with a Resilient Fallback Layer to guarantee 100% uptime even if Supabase free tier pauses.
 */
export const api = {
    
    // ==========================================
    // PROJECTS API
    // ==========================================
    projects: {
        /**
         * Returns static portfolio projects (managed directly in ProjectsPage).
         */
        getAll: async () => {
            return { success: true, data: [] };
        },
        getById: async (id) => {
            return { success: false, error: `Project ${id} not found` };
        }
    },

    // ==========================================
    // BLOG API
    // ==========================================
    blog: {
        /**
         * Fetches blog posts optionally filtered by type and status.
         * Falls back gracefully to static archive if live database is unreachable.
         */
        getAll: async (type = null, status = 'published') => {
            try {
                let query = supabase.from('blog_posts').select('*');
                if (type) query = query.eq('type', type);
                if (status && status !== 'all') query = query.eq('status', status);
                query = query.order('created_at', { ascending: false });
                
                const { data, error } = await query;
                if (!error && Array.isArray(data) && data.length > 0) {
                    return { success: true, data };
                }
                if (error && import.meta.env.DEV) {
                    console.warn('[Blog API] Database query failed, using static fallback:', error.message || error);
                }
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.warn('[Blog API] Connection error, using static fallback:', err);
                }
            }

            // High-resilience fallback
            let fallback = [...blogFallback];
            if (type) fallback = fallback.filter(p => p.type === type);
            if (status && status !== 'all') fallback = fallback.filter(p => p.status === status);
            return { success: true, data: fallback };
        },
        getById: async (id) => {
            try {
                const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
                if (!error && data) return { success: true, data };
            } catch {
                // fall through
            }
            const found = blogFallback.find(p => p.id == id);
            return found ? { success: true, data: found } : { success: false, error: 'Post not found' };
        },
        create: async (data) => {
            const { error } = await supabase.from('blog_posts').insert([data]);
            return error ? { success: false, error: error.message || error } : { success: true };
        },
        update: async (id, data) => {
            const { error } = await supabase.from('blog_posts').update(data).eq('id', id);
            return error ? { success: false, error: error.message || error } : { success: true };
        },
        delete: async (id) => {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            return error ? { success: false, error: error.message || error } : { success: true };
        },
        like: async (postId) => {
            const numericId = Number(postId);
            let likedList = [];
            if (typeof window !== 'undefined') {
                try {
                    likedList = JSON.parse(localStorage.getItem('imaforbes_liked_posts') || '[]').map(Number);
                } catch {
                    likedList = [];
                }
            }

            const alreadyLiked = likedList.includes(numericId);
            const nextLiked = !alreadyLiked;
            let updatedLikesCount = undefined;

            try {
                const { data: post } = await supabase
                    .from('blog_posts')
                    .select('likes_count')
                    .eq('id', numericId)
                    .single();

                const currentLikes = parseInt(post?.likes_count) || 0;
                updatedLikesCount = nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

                if (nextLiked) {
                    await supabase.from('blog_likes').insert([{ post_id: numericId, ip_address: 'anon' }]);
                }

                // Try secure RPC first (if configured in Supabase), fallback to direct update
                const rpcName = nextLiked ? 'increment_blog_like' : 'decrement_blog_like';
                const { data: rpcCount, error: rpcError } = await supabase.rpc(rpcName, { target_post_id: numericId });
                if (!rpcError && typeof rpcCount === 'number') {
                    updatedLikesCount = rpcCount;
                } else {
                    await supabase
                        .from('blog_posts')
                        .update({ likes_count: updatedLikesCount })
                        .eq('id', numericId);
                }
            } catch {
                // Resilient fallback if offline
            }

            if (typeof window !== 'undefined') {
                try {
                    const updatedList = nextLiked
                        ? Array.from(new Set([...likedList, numericId]))
                        : likedList.filter(id => id !== numericId);
                    localStorage.setItem('imaforbes_liked_posts', JSON.stringify(updatedList));
                } catch {
                    // ignore storage errors
                }
            }

            return {
                success: true,
                data: {
                    liked: nextLiked,
                    hasLiked: nextLiked,
                    likes_count: updatedLikesCount
                }
            };
        },
        getLikeStatus: async (postId) => {
            const numericId = Number(postId);
            let hasLiked = false;
            if (typeof window !== 'undefined') {
                try {
                    const likedList = JSON.parse(localStorage.getItem('imaforbes_liked_posts') || '[]').map(Number);
                    hasLiked = likedList.includes(numericId);
                } catch {
                    hasLiked = false;
                }
            }

            let likesCount = undefined;
            try {
                const { data: post } = await supabase
                    .from('blog_posts')
                    .select('likes_count')
                    .eq('id', numericId)
                    .single();
                if (post && post.likes_count !== undefined) {
                    likesCount = parseInt(post.likes_count) || 0;
                }
            } catch {
                // ignore
            }

            return {
                success: true,
                data: {
                    liked: hasLiked,
                    hasLiked,
                    ...(likesCount !== undefined ? { likes_count: likesCount } : {})
                }
            };
        },
        trackView: async (postId) => {
            const numericId = Number(postId);
            let updatedViewsCount = undefined;
            try {
                await supabase.from('blog_views').insert([{ post_id: numericId, ip_address: 'anon' }]);

                // Try secure RPC first (if configured in Supabase), fallback to direct update
                const { data: rpcCount, error: rpcError } = await supabase.rpc('increment_blog_view', { target_post_id: numericId });
                if (!rpcError && typeof rpcCount === 'number') {
                    updatedViewsCount = rpcCount;
                } else {
                    const { data: post } = await supabase
                        .from('blog_posts')
                        .select('views_count')
                        .eq('id', numericId)
                        .single();
                    if (post) {
                        updatedViewsCount = (parseInt(post.views_count) || 0) + 1;
                        await supabase
                            .from('blog_posts')
                            .update({ views_count: updatedViewsCount })
                            .eq('id', numericId);
                    }
                }
            } catch {
                // Resilient fallback
            }
            return {
                success: true,
                data: {
                    view_recorded: true,
                    ...(updatedViewsCount !== undefined ? { views_count: updatedViewsCount } : {})
                }
            };
        },
        getStats: async () => {
            try {
                const { data: posts, error } = await supabase.from('blog_posts').select('*');
                const items = !error && Array.isArray(posts) && posts.length > 0 ? posts : blogFallback;
                const totalPosts = items.length;
                const publishedPosts = items.filter(p => p.status === 'published').length;
                const draftPosts = items.filter(p => p.status === 'draft').length;
                const totalViews = items.reduce((sum, p) => sum + (parseInt(p.views_count) || 0), 0);
                const totalLikes = items.reduce((sum, p) => sum + (parseInt(p.likes_count) || 0), 0);
                const mostViewed = items.toSorted((a, b) => (parseInt(b.views_count) || 0) - (parseInt(a.views_count) || 0)).slice(0, 5);
                const mostLiked = items.toSorted((a, b) => (parseInt(b.likes_count) || 0) - (parseInt(a.likes_count) || 0)).slice(0, 5);

                return {
                    success: true,
                    data: {
                        totalPosts,
                        publishedPosts,
                        draftPosts,
                        totalViews,
                        totalLikes,
                        viewsLast7Days: totalViews,
                        viewsLast30Days: totalViews,
                        mostViewed,
                        mostLiked
                    }
                };
            } catch {
                return { success: true, data: {} };
            }
        },
        /**
         * Fetches approved comments for a specific blog post.
         */
        getComments: async (postId) => {
            try {
                const { data, error } = await supabase
                    .from('blog_comments')
                    .select('*')
                    .eq('post_id', postId)
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    return { success: true, data };
                }
            } catch (err) {
                if (import.meta.env?.DEV) {
                    console.warn('[Comments API] Falling back to local storage:', err);
                }
            }

            // Local fallback if table is not created yet or offline
            if (typeof window !== 'undefined') {
                try {
                    const local = JSON.parse(localStorage.getItem('imaforbes_local_comments') || '[]');
                    return {
                        success: true,
                        data: local.filter(c => String(c.post_id) === String(postId) && c.status !== 'hidden')
                    };
                } catch {
                    // ignore
                }
            }
            return { success: true, data: [] };
        },
        /**
         * Adds a new comment to a blog post.
         */
        addComment: async (postId, authorName, content) => {
            const payload = {
                post_id: Number(postId),
                author_name: authorName.trim(),
                content: content.trim(),
                status: 'approved'
            };

            try {
                const { data, error } = await supabase
                    .from('blog_comments')
                    .insert([payload])
                    .select()
                    .single();

                if (!error && data) {
                    return { success: true, data };
                }
                if (error && import.meta.env?.DEV) {
                    console.warn('[Comments API] Supabase insert error, using local fallback:', error.message);
                }
            } catch (err) {
                if (import.meta.env?.DEV) {
                    console.warn('[Comments API] Connection error on insert, using local fallback:', err);
                }
            }

            // Resilient fallback in localStorage so UI always responds smoothly
            const fallbackComment = {
                id: Date.now(),
                ...payload,
                created_at: new Date().toISOString()
            };
            if (typeof window !== 'undefined') {
                try {
                    const local = JSON.parse(localStorage.getItem('imaforbes_local_comments') || '[]');
                    local.unshift(fallbackComment);
                    localStorage.setItem('imaforbes_local_comments', JSON.stringify(local));
                } catch {
                    // ignore
                }
            }
            return { success: true, data: fallbackComment };
        }
    },

    // ==========================================
    // SETTINGS API
    // ==========================================
    settings: {
        get: async () => {
            try {
                const [settingsResult, messagesCountResult] = await Promise.all([
                    supabase.from('portfolio_settings').select('*'),
                    supabase.from('datos').select('*', { count: 'exact', head: true })
                ]);

                const { data, error } = settingsResult;
                const messagesCount = messagesCountResult?.count || 0;

                if (!error && Array.isArray(data)) {
                    const flatSettings = {};
                    const settingsMap = {};

                    data.forEach(item => {
                        flatSettings[item.setting_key] = item.setting_value;
                        settingsMap[item.setting_key] = {
                            value: item.setting_value,
                            description: item.description || ''
                        };
                    });

                    const systemStatus = {
                        database: 'connected',
                        api: 'working',
                        backup: 'completed',
                        message_count: messagesCount,
                        last_check: new Date().toLocaleString('es-ES')
                    };

                    return {
                        success: true,
                        data: {
                            success: true,
                            ...flatSettings,
                            settings: settingsMap,
                            system_status: systemStatus,
                            data: {
                                settings: settingsMap,
                                system_status: systemStatus
                            }
                        }
                    };
                }
            } catch {
                // fall through
            }
            return { success: true, data: {} };
        },
        update: async (newSettings) => {
            try {
                if (!newSettings || typeof newSettings !== 'object') {
                    return { success: false, error: 'Invalid settings payload' };
                }

                const entries = Object.entries(newSettings);
                const nowIso = new Date().toISOString();

                await Promise.all(
                    entries.map(async ([key, rawValue]) => {
                        const serializedValue =
                            typeof rawValue === 'object' && rawValue !== null
                                ? JSON.stringify(rawValue)
                                : String(rawValue ?? '');

                        const { error: updateError } = await supabase
                            .from('portfolio_settings')
                            .update({
                                setting_value: serializedValue,
                                updated_at: nowIso
                            })
                            .eq('setting_key', key);

                        if (updateError) {
                            throw new Error(updateError.message || String(updateError));
                        }
                    })
                );

                return { success: true };
            } catch (err) {
                return { success: false, error: err?.message || 'Failed to update settings' };
            }
        }
    },

    // ==========================================
    // WORK EXPERIENCES API
    // ==========================================
    experiences: {
        getAll: async (status = 'published') => {
            try {
                let query = supabase.from('work_experiences').select('*');
                if (status && status !== 'all') {
                    query = query.eq('status', status);
                }
                query = query.order('sort_order', { ascending: true });
                
                const { data, error } = await query;
                if (!error && Array.isArray(data) && data.length > 0) {
                    return { success: true, data: data.map(normalizeExperienceRecord) };
                }
                if (error && import.meta.env.DEV) {
                    console.warn('[Experiences API] Database query failed, using static fallback:', error.message || error);
                }
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.warn('[Experiences API] Connection error, using static fallback:', err);
                }
            }

            // High-resilience fallback
            let fallback = [...experienceFallback].map(normalizeExperienceRecord);
            if (status && status !== 'all') fallback = fallback.filter(e => e.status === status);
            return { success: true, data: fallback };
        },
        create: async (data) => {
            const { error } = await supabase.from('work_experiences').insert([data]);
            return error ? { success: false, error: error.message || error } : { success: true };
        },
        update: async (id, data) => {
            const { error } = await supabase.from('work_experiences').update(data).eq('id', id);
            return error ? { success: false, error: error.message || error } : { success: true };
        },
        delete: async (id) => {
            const { error } = await supabase.from('work_experiences').delete().eq('id', id);
            return error ? { success: false, error: error.message || error } : { success: true };
        }
    },

    // ==========================================
    // CONTACT API
    // ==========================================
    contact: {
        send: async (data) => {
            try {
                // Honeypot check (if bots fill hidden website field)
                if (data?.website && String(data.website).trim() !== '') {
                    return { success: true };
                }

                // Rate limit check (max 3 submissions per 10 minutes)
                const rateCheck = checkContactRateLimit();
                if (!rateCheck.allowed) {
                    return { success: false, error: rateCheck.error };
                }

                const { error } = await supabase.from('datos').insert([{
                    nombre: data.name,
                    email: data.email,
                    mensaje: data.message,
                    fecha: new Date().toISOString().split('T')[0],
                    ip_address: 'anon',
                    user_agent: typeof navigator !== 'undefined' ? (navigator.userAgent || 'unknown').slice(0, 250) : 'unknown'
                }]);
                if (error) return { success: false, error: error.message || 'No se pudo enviar el mensaje' };

                recordContactAttempt(rateCheck.recent);
                return { success: true };
            } catch (err) {
                return { success: false, error: err?.message || 'Error de conexión al enviar el mensaje' };
            }
        }
    },

    // ==========================================
    // AUTHENTICATION API
    // ==========================================
    auth: {
        login: async (credentials) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: (credentials?.email || credentials?.username || '').trim(),
                    password: credentials?.password
                });
                if (error) return { success: false, error: error.message };
                return {
                    success: true,
                    data: {
                        user: data.user,
                        token: data.session?.access_token
                    }
                };
            } catch (err) {
                return { success: false, error: err?.message || 'Authentication error' };
            }
        },
        logout: async () => {
            try {
                await supabase.auth.signOut();
            } catch {
                // ignore signOut network errors
            }
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('user_session');
                } catch {
                    // ignore storage errors
                }
            }
            return { success: true };
        },
        verify: async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data?.user) return { success: false };
                return { success: true, data: { user: data.user } };
            } catch {
                return { success: false };
            }
        }
    },

    // ==========================================
    // ADMIN API
    // ==========================================
    admin: {
        getStats: async () => {
            try {
                const [postsResult, messagesResult, commentsResult] = await Promise.all([
                    supabase.from('blog_posts').select('id, views_count, likes_count'),
                    supabase.from('datos').select('*', { count: 'exact', head: true }),
                    supabase.from('blog_comments').select('*', { count: 'exact', head: true }).then(r => r).catch(() => ({ count: 0 }))
                ]);

                const posts = Array.isArray(postsResult?.data) && postsResult.data.length > 0
                    ? postsResult.data
                    : blogFallback;

                const totalPosts = posts.length;
                const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views_count) || 0), 0);
                const totalLikes = posts.reduce((sum, p) => sum + (parseInt(p.likes_count) || 0), 0);

                return {
                    success: true,
                    data: {
                        total_posts: totalPosts,
                        total_messages: messagesResult?.count || 0,
                        total_views: totalViews,
                        total_likes: totalLikes,
                        total_comments: commentsResult?.count || 0
                    }
                };
            } catch (error) {
                return { success: false, error: error?.message || String(error) };
            }
        },
        getMessages: async (page = 1, limit = 10) => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            const { data, error, count } = await supabase
                .from('datos')
                .select('*', { count: 'exact' })
                .order('id', { ascending: false })
                .range(from, to);
                
            if (error) return { success: false, error: error.message || String(error) };
            return { success: true, data: { items: data || [], total: count || 0, page, limit } };
        },
        deleteMessage: async (id) => {
            const { error } = await supabase.from('datos').delete().eq('id', id);
            if (error) return { success: false, error: error.message || String(error) };
            return { success: true };
        },
        getAllComments: async () => {
            try {
                const { data, error } = await supabase
                    .from('blog_comments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    return { success: true, data };
                }
            } catch (err) {
                if (import.meta.env?.DEV) {
                    console.warn('[Admin Comments API] Falling back to local storage:', err);
                }
            }

            if (typeof window !== 'undefined') {
                try {
                    const local = JSON.parse(localStorage.getItem('imaforbes_local_comments') || '[]');
                    return { success: true, data: local };
                } catch {
                    // ignore
                }
            }
            return { success: true, data: [] };
        },
        deleteComment: async (id) => {
            try {
                const { error } = await supabase.from('blog_comments').delete().eq('id', id);
                if (!error) {
                    if (typeof window !== 'undefined') {
                        try {
                            const local = JSON.parse(localStorage.getItem('imaforbes_local_comments') || '[]');
                            localStorage.setItem('imaforbes_local_comments', JSON.stringify(local.filter(c => String(c.id) !== String(id))));
                        } catch {
                            // ignore
                        }
                    }
                    return { success: true };
                }
            } catch {
                // fall through to local cleanup
            }

            if (typeof window !== 'undefined') {
                try {
                    const local = JSON.parse(localStorage.getItem('imaforbes_local_comments') || '[]');
                    localStorage.setItem('imaforbes_local_comments', JSON.stringify(local.filter(c => String(c.id) !== String(id))));
                    return { success: true };
                } catch {
                    // ignore
                }
            }
            return { success: false, error: 'Failed to delete comment' };
        }
    },

    // ==========================================
    // UPLOAD API
    // ==========================================
    upload: {
        image: async (file) => {
            if (!file) {
                return { success: false, error: 'No se seleccionó ningún archivo' };
            }

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const rawExt = (file.name?.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fileExt = allowedExts.includes(rawExt) ? rawExt : 'jpg';

            if (!allowedMimeTypes.includes(file.type)) {
                return { success: false, error: 'Formato de imagen no permitido (solo JPG, PNG, WebP o GIF)' };
            }

            const maxSizeBytes = 20 * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                return { success: false, error: 'La imagen excede el tamaño máximo permitido (20 MB)' };
            }

            const uniqueId =
                typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID().replace(/-/g, '')
                    : `${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
            const fileName = `${uniqueId}_${Math.floor(Date.now() / 1000)}.${fileExt}`;
            const filePath = `images/${fileName}`;
            
            const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file, {
                cacheControl: '31536000',
                upsert: false,
                contentType: file.type
            });
            if (uploadError) return { success: false, error: uploadError.message || String(uploadError) };
            
            const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
            return { success: true, data: { url: data.publicUrl, filename: fileName } };
        }
    }
};

export default api;
