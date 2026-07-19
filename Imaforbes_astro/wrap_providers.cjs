const fs = require('fs');
const path = require('path');

const filesToWrap = [
  'src/components/Header.jsx',
  'src/components/Footer.jsx',
  'src/components/Breadcrumbs.jsx',
  'src/components/BrowserSupport.jsx',
  'src/components/ScrollToTopButton.jsx',
  'src/pages_react/HomePage.jsx',
  'src/pages_react/AboutPage.jsx',
  'src/pages_react/ProjectsPage.jsx',
  'src/pages_react/BlogPage.jsx',
  'src/pages_react/ContactPage.jsx',
  'src/pages_react/LoginPage.jsx',
  'src/pages_react/Dashboard.jsx',
  'src/pages_react/AdminMensajes.jsx',
  'src/pages_react/AdminBlog.jsx',
  'src/pages_react/AdminExperiences.jsx',
  'src/pages_react/StatisticsPage.jsx',
  'src/pages_react/ConfigurationPage.jsx'
];

filesToWrap.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('withProviders(')) return; // Already wrapped
  
  const relativePath = file.startsWith('src/pages_react') ? '../components/withProviders.jsx' : './withProviders.jsx';
  
  // Find export default ComponentName;
  const match = content.match(/export default (\w+);/);
  if (match) {
    const componentName = match[1];
    content = `import withProviders from '${relativePath}';\n` + content;
    content = content.replace(/export default \w+;/, `export default withProviders(${componentName});`);
    fs.writeFileSync(file, content);
    console.log(`Wrapped ${file}`);
  } else {
    console.log(`Could not find export default in ${file}`);
  }
});
