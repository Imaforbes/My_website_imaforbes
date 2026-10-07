import re

with open('src/styles/index.css', 'r') as f:
    content = f.read()

old_body = """body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
  margin: 0;
  padding: 0;
"""

new_body = """body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
"""

content = content.replace(old_body, new_body)

with open('src/styles/index.css', 'w') as f:
    f.write(content)
