import re

with open('src/pages_react/LoginPage.jsx', 'r') as f:
    content = f.read()

# Replace the fetch logic in handleLogin with Supabase logic
new_login_logic = """
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { supabase } = await import('../services/supabase.js');
      // Supabase usa email, así que el campo 'username' lo usaremos como email
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });
      
      if (signInError) {
        setError(signInError.message || "Error al iniciar sesión.");
        return;
      }
      
      if (data.session) {
        localStorage.setItem('auth_token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate("/admin");
        }, 100);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Login error:", err);
      }
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    }
  };
"""

# Extract everything before `const handleLogin` and after it
part1 = content.split('const handleLogin = async (e) => {')[0]
part2 = content.split('  // --- FIN DE LA LÓGICA AÑADIDA ---')[1]

# In the form, change "USUARIO" to "CORREO (EMAIL)"
part2 = part2.replace('placeholder="USUARIO"', 'placeholder="CORREO (EMAIL)"')
# And remove import of API_CONFIG if it's unused, though keeping it is harmless

with open('src/pages_react/LoginPage.jsx', 'w') as f:
    f.write(part1 + new_login_logic + "\n  // --- FIN DE LA LÓGICA AÑADIDA ---" + part2)

print("LoginPage updated.")
