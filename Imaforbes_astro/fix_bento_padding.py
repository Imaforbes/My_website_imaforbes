import re

with open('src/styles/index.css', 'r') as f:
    content = f.read()

# Add padding override to mobile media query
old_mq = """@media (max-width: 768px) {
  .bento-item-half { grid-column: span 12; }
  .bento-item-small { grid-column: span 12; }
}"""

new_mq = """@media (max-width: 768px) {
  .bento-item-half { grid-column: span 12; }
  .bento-item-small { grid-column: span 12; }
  .bento-item { padding: 1.5rem; }
  .bento-grid { gap: 1rem; }
}"""

content = content.replace(old_mq, new_mq)

with open('src/styles/index.css', 'w') as f:
    f.write(content)
