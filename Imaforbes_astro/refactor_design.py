import os
import glob
import re

replacements = {
    'var(--color-bg-light)': 'var(--color-bg)',
    'var(--color-bg-dark)': 'var(--color-bg)',
    'var(--color-surface-light)': 'var(--color-surface)',
    'var(--color-surface-dark)': 'var(--color-surface)',
    'var(--color-text-light)': 'var(--color-text)',
    'var(--color-text-dark)': 'var(--color-text)',
    'var(--color-text-muted-light)': 'var(--color-text-muted)',
    'var(--color-text-muted-dark)': 'var(--color-text-muted)',
    'var(--color-border-light)': 'var(--color-border)',
    'var(--color-border-dark)': 'var(--color-border)',
    'var(--font-serif)': 'var(--font-sans)',
    'headline-1': 'headline-1', # Just mapping it so we don't forget
}

files_to_check = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.astro', recursive=True) + glob.glob('src/styles/*.css', recursive=True)

for file in files_to_check:
    with open(file, 'r') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            modified = True
            
    # Also strip out 'dark:hidden' and 'hidden dark:block' from the Background
    if 'HeroBackground' in content or 'HomePage.jsx' in file:
        content = re.sub(r'className="dark:hidden"', '', content)
        content = re.sub(r'className="hidden dark:block"', '', content)
        content = re.sub(r'html\.dark\s+', '', content)
        modified = True
        
    if modified:
        with open(file, 'w') as f:
            f.write(content)
        print(f"Refactored {file}")

print("Done")
