const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = [...walk('src/components'), ...walk('src/pages_react')];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace imports
  content = content.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-router-dom['"];/g, (match, imports) => {
    const keep = imports.split(',').map(i => i.trim()).filter(i => i !== 'Link' && i !== 'useNavigate' && i !== 'useLocation' && i !== 'Routes' && i !== 'Route');
    if (keep.length > 0) return `import { ${keep.join(', ')} } from 'react-router-dom';`;
    return '';
  });
  
  // Replace Link
  content = content.replace(/<Link /g, '<a ');
  content = content.replace(/<\/Link>/g, '</a>');
  content = content.replace(/ to="/g, ' href="');
  content = content.replace(/ to={/g, ' href={');
  
  fs.writeFileSync(file, content);
});
console.log('Refactoring complete');
