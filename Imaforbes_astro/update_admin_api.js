import fs from 'fs';

let content = fs.readFileSync('src/services/api.js', 'utf-8');

const adminLogic = `
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
        const fileName = \`\${Math.random()}.\${fileExt}\`;
        const filePath = \`images/\${fileName}\`;
        
        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) return { success: false, error: uploadError };
        
        const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        return { success: true, data: { url: data.publicUrl } };
    }
};
`;

content = content.replace(/api\.admin = \{.*?\};/s, '');
content = content.replace(/api\.upload = \{.*?\};/s, '');
content += "\n" + adminLogic;

fs.writeFileSync('src/services/api.js', content);
