import re

with open('src/pages_react/TrajectoryPage.jsx', 'r') as f:
    content = f.read()

old_desc = """{experience.description && <p className="text-muted" style={{ marginBottom: experience.technologies?.length ? '1rem' : 0, lineHeight: 1.7 }}>{experience.description}</p>}"""
new_desc = """{experience.description && <p className="text-muted" style={{ marginBottom: experience.technologies?.length ? '1.5rem' : 0, lineHeight: 1.7 }}>{experience.description}</p>}"""

content = content.replace(old_desc, new_desc)

with open('src/pages_react/TrajectoryPage.jsx', 'w') as f:
    f.write(content)
