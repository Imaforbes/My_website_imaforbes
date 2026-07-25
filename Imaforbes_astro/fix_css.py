import sys

file_path = "src/styles/index.css"

with open(file_path, "r") as f:
    lines = f.readlines()

new_lines = []
skip = False

for i, line in enumerate(lines):
    if line.startswith(".projects-grid {"):
        # We replace .projects-grid entirely, and skip until we find a closing bracket
        new_lines.append(".projects-grid {\n")
        new_lines.append("  display: grid;\n")
        new_lines.append("  grid-template-columns: 1fr;\n")
        new_lines.append("  gap: 3rem;\n")
        new_lines.append("  padding: 3rem 0;\n")
        new_lines.append("}\n\n")
        new_lines.append("@media (min-width: 768px) {\n")
        new_lines.append("  .projects-grid {\n")
        new_lines.append("    grid-template-columns: repeat(2, 1fr);\n")
        new_lines.append("  }\n")
        new_lines.append("}\n\n")
        new_lines.append("@media (min-width: 1200px) {\n")
        new_lines.append("  .projects-grid {\n")
        new_lines.append("    grid-template-columns: repeat(3, 1fr);\n")
        new_lines.append("  }\n")
        new_lines.append("}\n")
        skip = True
        continue
    
    if skip and line.startswith("}"):
        skip = False
        continue
        
    if skip:
        continue
        
    if line.startswith(".project-card {"):
        skip = True
        continue
        
    if line.startswith(".project-image-container {"):
        # We reached the end of the cinematic block, stop skipping if we were
        skip = False
        
    if not skip:
        new_lines.append(line)

with open(file_path, "w") as f:
    f.writelines(new_lines)

print("Done")
