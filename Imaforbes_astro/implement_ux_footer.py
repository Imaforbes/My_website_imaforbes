import re

with open('src/components/Footer.jsx', 'r') as f:
    content = f.read()

# 1. Update Navigation Links (Fitts's Law)
old_nav_style = """                    style={{ 
                      textDecoration: 'none', 
                      fontSize: '0.95rem',
                      color: location.pathname === item.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: location.pathname === item.path ? 500 : 300,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'color 0.2s ease'
                    }}"""

new_nav_style = """                    style={{ 
                      textDecoration: 'none', 
                      fontSize: '0.95rem',
                      color: location.pathname === item.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: location.pathname === item.path ? 500 : 300,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'color 0.2s ease',
                      padding: '0.5rem 0',
                      minHeight: '44px' /* Fitts's Law: 44x44px minimum touch target */
                    }}"""
content = content.replace(old_nav_style, new_nav_style)

# 2. Update Email Link (Fitts's Law)
old_email_style = """<a href="mailto:imanol@imaforbes.com" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem' }} className="dark:hover:text-text">"""

new_email_style = """<a href="mailto:imanol@imaforbes.com" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem', padding: '0.5rem', margin: '-0.5rem', borderRadius: '8px', minHeight: '44px' }} className="dark:hover:text-text hover:bg-surface dark:hover:bg-[#111] transition-colors">"""
content = content.replace(old_email_style, new_email_style)

with open('src/components/Footer.jsx', 'w') as f:
    f.write(content)
