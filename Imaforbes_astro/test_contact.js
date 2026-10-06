import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = env.match(/PUBLIC_SUPABASE_ANON_KEY="(.*?)"/);

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('datos').insert([{
        nombre: 'Test',
        email: 'test@example.com',
        mensaje: 'Test message',
        fecha: new Date().toISOString().split('T')[0],
        ip_address: 'anon',
        user_agent: 'test'
    }]);
    console.log("Error:", JSON.stringify(error, null, 2));
}
test();
