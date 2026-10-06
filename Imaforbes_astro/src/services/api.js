import { supabase } from './supabase';

export const api = {
    // Projects endpoints
    projects: {
        getAll: async () => {
            const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
            if (error) return { success: false, error };
            return { success: true, data };
        },
        getById: async (id) => {
            const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
            if (error) return { success: false, error };
            return { success: true, data };
        }
    },

    // Blog endpoints
    blog: {
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
        like: async (postId) => {
            try {
                // Record the like
                await supabase.from('blog_likes').insert([{ post_id: postId, ip_address: 'anon' }]);
                
                // Manually increment likes (safe enough for a personal blog)
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
             // For now, we return that they haven't liked it yet
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

    // Settings endpoints
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

    // Work Experiences endpoints
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
    }
};

export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
    return { type: 'UNKNOWN', message: error?.message || fallbackMessage };
};

export default api;

// Adding missing endpoints that the frontend expects
api.contact = {
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
};

api.auth = {
    login: async () => ({ success: false, error: 'Not implemented yet' }),
    logout: async () => ({ success: true }),
    verify: async () => ({ success: false })
};






api.admin = {
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
};

api.blog.create = async (data) => {
    const { error } = await supabase.from('blog_posts').insert([data]);
    return error ? { success: false, error } : { success: true };
};

api.blog.update = async (id, data) => {
    const { error } = await supabase.from('blog_posts').update(data).eq('id', id);
    return error ? { success: false, error } : { success: true };
};

api.blog.delete = async (id) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    return error ? { success: false, error } : { success: true };
};

api.upload = {
    image: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) return { success: false, error: uploadError };
        
        const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        return { success: true, data: { url: data.publicUrl } };
    }
};
