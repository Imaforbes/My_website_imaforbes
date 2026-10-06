import re

with open('src/pages_react/Dashboard.jsx', 'r') as f:
    content = f.read()

new_logout = """  const handleLogout = async () => {
    try {
      const { supabase } = await import('../services/supabase.js');
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };"""

content = re.sub(r'const handleLogout = async \(\) => \{.*?\};\n', new_logout + '\n', content, flags=re.DOTALL)

with open('src/pages_react/Dashboard.jsx', 'w') as f:
    f.write(content)
print("Dashboard updated.")
