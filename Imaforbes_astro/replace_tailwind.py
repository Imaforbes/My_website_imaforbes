import os
import glob
import re

files_to_check = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.astro', recursive=True)

for file in files_to_check:
    with open(file, 'r') as f:
        content = f.read()
    
    original = content
    
    # Text colors
    content = re.sub(r'\btext-gray-[1-4]00\b', 'text-text-muted', content)
    content = re.sub(r'\btext-gray-[5-9]00\b', 'text-text', content)
    content = re.sub(r'\btext-white\b', 'text-text', content)
    content = re.sub(r'\btext-black\b', 'text-text', content)
    content = re.sub(r'\bdark:text-gray-[1-4]00\b', 'text-text-muted', content)
    content = re.sub(r'\bdark:text-gray-[5-9]00\b', 'text-text', content)
    content = re.sub(r'\bdark:text-white\b', 'text-text', content)
    
    # Background colors
    content = re.sub(r'\bbg-white\b', 'bg-surface', content)
    content = re.sub(r'\bbg-black\b', 'bg-background', content)
    content = re.sub(r'\bbg-gray-[5-9]00\b', 'bg-background', content)
    content = re.sub(r'\bbg-gray-[1-4]00\b', 'bg-surface', content)
    content = re.sub(r'\bdark:bg-gray-[1-9]00\b', 'bg-surface', content)
    content = re.sub(r'\bdark:bg-black\b', 'bg-background', content)
    
    # Border colors
    content = re.sub(r'\bborder-gray-[1-9]00\b', 'border-strong', content)
    content = re.sub(r'\bdark:border-gray-[1-9]00\b', 'border-strong', content)
    
    # Border radius
    content = re.sub(r'\brounded-lg\b', 'rounded-2xl', content)
    content = re.sub(r'\brounded-xl\b', 'rounded-2xl', content)
    content = re.sub(r'\brounded-md\b', 'rounded-2xl', content)
    
    if content != original:
        with open(file, 'w') as f:
            f.write(content)
        print(f"Updated Tailwind classes in {file}")

print("Done")
