import re

with open('src/pages_react/AboutPage.jsx', 'r') as f:
    content = f.read()

old_logic = """        // Check if result is successful and has data
        if (result.success && result.data) {
          const apiResponse = result.data;
          
          if (apiResponse.success && Array.isArray(apiResponse.data)) {
            const experiencesData = apiResponse.data;
            // Sort by sort_order, then by created_at
            const sorted = experiencesData.sort((a, b) => {
              if (a.sort_order !== b.sort_order) {
                return a.sort_order - b.sort_order;
              }
              return new Date(b.created_at) - new Date(a.created_at);
            });
            setExperiences(sorted);
            return; // Success, exit early
          }
        }
        
        // Fallback to i18n
        const fallbackExperiences = t("about.experience", { returnObjects: true });
        if (Array.isArray(fallbackExperiences)) {
          setExperiences(fallbackExperiences);
        } else {
          setExperiences([]);
        }"""

new_logic = """        // Check if result is successful and has data
        if (result.success && Array.isArray(result.data)) {
          const sorted = [...result.data].sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return new Date(b.created_at) - new Date(a.created_at);
          });
          setExperiences(sorted);
        } else {
          setExperiences([]);
        }"""

content = content.replace(old_logic, new_logic)

with open('src/pages_react/AboutPage.jsx', 'w') as f:
    f.write(content)

