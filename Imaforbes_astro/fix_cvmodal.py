import re

with open('src/components/CvModal.jsx', 'r') as f:
    content = f.read()

old_className = 'className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl text-text"'
new_className = 'className="relative w-full max-w-md max-h-[95vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl text-text"'

content = content.replace(old_className, new_className)

with open('src/components/CvModal.jsx', 'w') as f:
    f.write(content)

