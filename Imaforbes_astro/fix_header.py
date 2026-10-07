import re

with open('src/components/Header.jsx', 'r') as f:
    content = f.read()

old_nav = "style={{ position: 'fixed', top: '5rem', left: 0, right: 0, background: 'var(--color-bg)', zIndex: 50, borderTop: '1px solid var(--color-border)' }}"
new_nav = "style={{ position: 'fixed', top: '5rem', left: 0, right: 0, background: 'var(--color-bg)', zIndex: 50, borderTop: '1px solid var(--color-border)', maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}"

content = content.replace(old_nav, new_nav)

with open('src/components/Header.jsx', 'w') as f:
    f.write(content)

