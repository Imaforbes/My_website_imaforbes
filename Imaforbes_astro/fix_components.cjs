const fs = require('fs');

function restoreAndFix(componentName) {
  const sourceFile = `../Imaforbes_frontend/src/components/${componentName}.jsx`;
  const destFile = `./src/components/${componentName}.jsx`;
  
  if (!fs.existsSync(sourceFile)) return;
  
  let content = fs.readFileSync(sourceFile, 'utf8');
  
  // 1. Link to a
  content = content.replace(/<Link\s/g, '<a ');
  content = content.replace(/<Link\n/g, '<a\n');
  
  // 2. Add withProviders
  content = `import withProviders from './withProviders.jsx';\n` + content;
  content = content.replace(`export default ${componentName};`, `export default withProviders(${componentName});`);
  
  // 3. Add currentPath
  if (componentName === 'Header') {
    content = content.replace(`const Header = memo(() => {`, `const Header = memo(({ currentPath }) => {`);
    content = content.replace(`const location = { pathname: typeof window !== "undefined" ? window.location.pathname : "/" };`, `const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };`);
  } else if (componentName === 'Footer') {
    content = content.replace(`const Footer = memo(() => {`, `const Footer = memo(({ currentPath }) => {`);
    content = content.replace(`const location = { pathname: typeof window !== "undefined" ? window.location.pathname : "/" };`, `const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };`);
  }
  
  fs.writeFileSync(destFile, content);
  console.log(`Restored and fixed ${componentName}.jsx`);
}

restoreAndFix('Header');
restoreAndFix('Footer');
