import { supabase } from './supabase.js';

/**
 * Standardizes API error responses.
 * @param {Error|any} error - The caught error object
 * @param {string} [fallbackMessage='An error occurred'] - Default message if error has none
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
    return { type: 'UNKNOWN', message: error?.message || fallbackMessage };
};

/**
 * Centralized API client interacting with Supabase Backend-as-a-Service (BaaS).
 * Replaces legacy PHP endpoints with direct modern database calls.
 */
export const api = {
    
    // ==========================================
    // PROJECTS API
    // ==========================================
    projects: {
        /**
         * Fetches all projects ordered by sort_order.
         */
        getAll: async () => {
            const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
            if (error) return { success: false, error };
            return { success: true, data };
        },
        /**
         * Fetches a specific project by ID.
         */
        getById: async (id) => {
            const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error) return { success: false, error };
            return { success: true, data };
        }
    },

    // ==========================================
    // BLOG API
    // ==========================================
    blog: {
        /**
         * Fetches blog posts optionally filtered by type and status.
         */
        getAll: async (type = null, status = 'published') => {
            let query = supabase.from('blog_posts').select('*');
            if (type) query = query.eq('type', type);
            if (status) query = query.eq('status', status);
            query = query.order('created_at', { ascending: false });
            
            const { data, error } = await query;
            if (error) return { success: false, error };
            return { success: true, data };
        },
        getById: async (id) => {
            const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
            if (error) return { success: false, error };
            return { success: true, data };
        },
        create: async (data) => {
            const { error } = await supabase.from('blog_posts').insert([data]);
            return error ? { success: false, error } : { success: true };
        },
        update: async (id, data) => {
            const { error } = await supabase.from('blog_posts').update(data).eq('id', id);
            return error ? { success: false, error } : { success: true };
        },
        delete: async (id) => {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            return error ? { success: false, error } : { success: true };
        },
        like: async (postId) => {
            try {
                await supabase.from('blog_likes').insert([{ post_id: postId, ip_address: 'anon' }]);
                const { data: post } = await supabase.from('blog_posts').select('likes_count').eq('id', postId).single();
                if (post) {
                    await supabase.from('blog_posts').update({ likes_count: (post.likes_count || 0) + 1 }).eq('id', postId);
                }
                return { success: true };
            } catch (err) {
                return { success: false, error: err };
            }
        },
        getLikeStatus: async (postId) => {
             return { success: true, data: { hasLiked: false } };
        },
        trackView: async (postId) => {
            try {
                await supabase.from('blog_views').insert([{ post_id: postId, ip_address: 'anon' }]);
                const { data: post } = await supabase.from('blog_posts').select('views_count').eq('id', postId).single();
                if (post) {
                    await supabase.from('blog_posts').update({ views_count: (post.views_count || 0) + 1 }).eq('id', postId);
                }
                return { success: true };
            } catch (err) {
                return { success: false };
            }
        },
        getStats: async (postId = null) => {
            return { success: true, data: {} };
        }
    },

    // ==========================================
    // SETTINGS API
    // ==========================================
    settings: {
        get: async () => {
            const { data, error } = await supabase.from('portfolio_settings').select('*');
            if (error) return { success: false, error };
            
            const settingsObj = {};
            if (data) {
                data.forEach(item => {
                    settingsObj[item.setting_key] = item.setting_value;
                });
            }
            return { success: true, data: settingsObj };
        }
    },

    // ==========================================
    // WORK EXPERIENCES API
    // ==========================================
    experiences: {
        getAll: async (status = 'published') => {
            let query = supabase.from('work_experiences').select('*');
            if (status !== 'all') {
                query = query.eq('status', status);
            }
            query = query.order('sort_order', { ascending: true });
            
            const { data, error } = await query;
            if (error) return { success: false, error };
            return { success: true, data };
        }
    },

    // ==========================================
    // CONTACT API
    // ==========================================
    contact: {
        send: async (data) => {
            try {
                const { error } = await supabase.from('datos').insert([{
                    nombre: data.name,
                    email: data.email,
                    mensaje: data.message,
                    fecha: new Date().toISOString().split('T')[0],
                    ip_address: 'anon',
                    user_agent: navigator.userAgent || 'unknown'
                }]);
                if (error) return { success: false, error };
                return { success: true };
            } catch (err) {
                return { success: false, error: err };
            }
        }
    },

    // ==========================================
    // AUTHENTICATION API
    // ==========================================
    auth: {
        login: async () => ({ success: false, error: 'Not implemented yet' }),
        logout: async () => ({ success: true }),
        verify: async () => ({ success: false })
    },

    // ==========================================
    // ADMIN API
    // ==========================================
    admin: {
        getStats: async () => {
            try {
                const { count: postsCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
                const { count: messagesCount } = await supabase.from('datos').select('*', { count: 'exact', head: true });
                const { data: viewsData } = await supabase.from('blog_views').select('id');
                const { data: likesData } = await supabase.from('blog_likes').select('id');
                
                return {
                    success: true,
                    data: {
                        total_posts: postsCount || 0,
                        total_messages: messagesCount || 0,
                        total_views: viewsData ? viewsData.length : 0,
                        total_likes: likesData ? likesData.length : 0
                    }
                };
            } catch (error) {
                return { success: false, error };
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
                
            if (error) return { success: false, error };
            return { success: true, data: { items: data, total: count, page, limit } };
        },
        deleteMessage: async (id) => {
            const { error } = await supabase.from('datos').delete().eq('id', id);
            if (error) return { success: false, error };
            return { success: true };
        }
    },

    // ==========================================
    // UPLOAD API
    // ==========================================
    upload: {
        image: async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `images/${fileName}`;
            
            const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
            if (uploadError) return { success: false, error: uploadError };
            
            const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
            return { success: true, data: { url: data.publicUrl } };
        }
    }
};

export default api;
