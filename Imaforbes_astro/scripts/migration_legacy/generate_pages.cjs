const fs = require('fs');
const path = require('path');

const publicPages = [
  { file: 'index.astro', component: 'HomePage', path: '../pages_react/HomePage.jsx' },
  { file: 'about.astro', component: 'AboutPage', path: '../pages_react/AboutPage.jsx' },
  { file: 'projects.astro', component: 'ProjectsPage', path: '../pages_react/ProjectsPage.jsx' },
  { file: 'blog.astro', component: 'BlogPage', path: '../pages_react/BlogPage.jsx' },
  { file: 'contact.astro', component: 'ContactPage', path: '../pages_react/ContactPage.jsx' },
  { file: 'login.astro', component: 'LoginPage', path: '../pages_react/LoginPage.jsx', isAdmin: true }
];

const adminPages = [
  { file: 'index.astro', component: 'Dashboard', path: '../../pages_react/Dashboard.jsx' },
  { file: 'mensajes.astro', component: 'AdminMensajes', path: '../../pages_react/AdminMensajes.jsx' },
  { file: 'blog.astro', component: 'AdminBlog', path: '../../pages_react/AdminBlog.jsx' },
  { file: 'experiences.astro', component: 'AdminExperiences', path: '../../pages_react/AdminExperiences.jsx' },
  { file: 'stats.astro', component: 'StatisticsPage', path: '../../pages_react/StatisticsPage.jsx' },
  { file: 'settings.astro', component: 'ConfigurationPage', path: '../../pages_react/ConfigurationPage.jsx' }
];

// Ensure directories exist
if (!fs.existsSync('src/pages')) fs.mkdirSync('src/pages', { recursive: true });
if (!fs.existsSync('src/pages/admin')) fs.mkdirSync('src/pages/admin', { recursive: true });

publicPages.forEach(p => {
  const content = `---
import Layout from '../layouts/Layout.astro';
import ${p.component} from '${p.path}';
---

<Layout isAdmin={${p.isAdmin ? 'true' : 'false'}}>
  <${p.component} client:only="react" />
</Layout>
`;
  fs.writeFileSync(path.join('src/pages', p.file), content);
});

adminPages.forEach(p => {
  const content = `---
import Layout from '../../layouts/Layout.astro';
import ${p.component} from '${p.path}';
---

<Layout isAdmin={true}>
  <${p.component} client:only="react" />
</Layout>
`;
  fs.writeFileSync(path.join('src/pages/admin', p.file), content);
});

console.log('Pages generated');
