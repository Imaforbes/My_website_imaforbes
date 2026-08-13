// src/pages_react/CvPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import withProviders from '../components/withProviders.jsx';

const cvData = {
    en: `# IMANOL PEREZ ARTEAGA
**SOFTWARE ENGINEER | FULL-STACK DEVELOPER**

📍 Mexico City, Mexico  
✉️ Imanol@imaforbes.com  
🌐 https://www.imaforbes.com  
💼 https://www.linkedin.com/in/imanol-perez  
💻 https://github.com/Imaforbes  

---

## 🚀 PROFESSIONAL SUMMARY
Software Engineer with experience building robust web and business applications, with a background in Computer Systems Engineering and a Master’s degree in Marketing. Experienced in full-stack development, backend engineering, database design, system architecture, process automation, financial systems, workflow management, and IT infrastructure. Skilled in Python, FastAPI, React, JavaScript, SQL, PHP, and cloud deployment. Proven ability to translate complex operational requirements into secure, scalable software solutions that digitize manual workflows, centralize business information, improve operational efficiency, and support data-driven decision-making.

---

## 🛠️ TECHNICAL SKILLS
- **Programming Languages:** Python, JavaScript, PHP, C++
- **Frontend Development:** React, HTML5, CSS3, Responsive Web Design
- **Backend & APIs:** FastAPI, Node.js, REST APIs, Backend Development
- **Databases:** SQL, MySQL, MongoDB, Supabase, Database Design, Database Management
- **Cloud & Deployment:** Vercel, Microsoft Azure, Supabase
- **Software Engineering:** Full-Stack Development, System Architecture, System Integration, API Integration, Process Automation, Workflow Automation, Business Applications
- **Systems & Infrastructure:** Linux, Bash, Network Architecture, VLANs, System Troubleshooting
- **Tools & Automation:** Git, GitHub, Terminal, FFmpeg, Google AI Studio API

---

## 💼 PROFESSIONAL EXPERIENCE

### **ALLEGRO SAN ÁNGEL INN / CORPORATE GROUP**
**Lead Software Engineer** | *September 2025 – Present*
- Lead the end-to-end development of a custom CRM and operational management system to modernize legal and administrative workflows. Engineered a robust architecture featuring automated prospect tracking, smart email dispatching, and AI-powered drafting for client communications using Google Gemini. Designed a responsive, high-performance frontend with dynamic animations, deeply integrated with a secure Python backend and a relational database to manage complex legal portfolios, real estate transactions, and financial control.
- **Technologies:** React, JavaScript, Vite, CSS / Bootstrap, Framer Motion, Python, Flask, Google Gemini AI, MySQL, Linux Shell, REST APIs, SMTP

### **INDEPENDENT PROJECTS & CONSULTING**
**Full-Stack Developer & Technical IT Project Manager** | *May 2026 – Present*
- **2026 FIFA World Cup Sports Pool:** Launched a production web application for a 2026 FIFA World Cup sports pool, developing the frontend with React, implementing backend and database functionality with Supabase, and deploying through Vercel.
- **AI-Assisted Training Material Processing:** Automated the processing of 5 software training sessions, generating consolidated summaries by extracting audio through FFmpeg/Linux terminal scripts and processing the resulting data through the Google AI Studio API.
- **Independent Cinema IT Consulting:** Evaluated technology and infrastructure solutions for an independent cinema, delivering a technical and financial feasibility analysis by comparing box-office, concession-management, and operational software solutions for tenant operators.

### **EARLY PROFESSIONAL EXPERIENCE**

#### **JA MÉXICO**
**Full-Stack Developer** | *September 2023 – November 2023*
- Supported participants in launching their first operational web pages, providing hands-on development guidance, coding support, and troubleshooting using HTML, CSS, and JavaScript.
- Improved participants’ ability to complete web development projects, by providing hands-on coding, debugging, and implementation support throughout the development process.

#### **MICROSOFT — LAUNCH-X PROGRAM**
**Full-Stack Developer** | *August 2022 – December 2022*
- Developed a full-stack mobile application project, delivering frontend, backend, database, and cloud components by applying JavaScript, Vue.js, Node.js, MySQL, MongoDB, and Microsoft Azure throughout the development lifecycle.
- Implemented responsive frontend functionality, delivering interactive screens and components using HTML, CSS, JavaScript, and Vue.js.
- Developed backend and database components, integrating application functionality with persistent data using Node.js, MySQL, MongoDB, and Microsoft Azure.

#### **ACCENTURE / JA MÉXICO**
**Developer** | *April 2022 – July 2022*
- Developed a functional mobile technology prototype, applying software development tools and product design methodologies throughout the project lifecycle.

---

## 🎓 EDUCATION

### **UNIVERSIDAD ICEL**
- **Master’s Degree in Marketing** | *May 2022 – April 2023*
- **Bachelor’s Degree in Computer Systems Engineering** | *September 2017 – August 2020*

---

## 📜 CERTIFICATIONS & PROFESSIONAL DEVELOPMENT
- **Intensive English Course — Trinity ISE** | Future Learning Ireland, Dublin | *October 2024 – May 2025*
- **Web Development** | Google | *October 2022*
- **Creation of Facial Filters for Instagram with Spark AR** | Platzi | *January 2022*
- **Introduction to Cybersecurity** | Cisco | *October 2021*
- **NDG Linux Essentials** | Cisco | *May 2021*

---

## 🌍 LANGUAGES
- **Spanish:** Native
- **English:** B2 — Upper-Intermediate
`,
  es: `# IMANOL PEREZ ARTEAGA
**INGENIERO EN SISTEMAS | SOFTWARE ENGINEER**

📍 CDMX, México  
✉️ Imanol@imaforbes.com  
🌐 https://www.imaforbes.com  
💼 https://www.linkedin.com/in/imanol-perez  
💻 https://github.com/Imaforbes  

---

## 🚀 SOBRE MÍ
Ingeniero de software con formación en marketing y enfoque humano en la tecnología.  
Diseño soluciones que equilibran lógica, creatividad y propósito.  
Creo en la tecnología como puente entre necesidades reales y experiencias significativas.  
Combino pensamiento analítico con sensibilidad estratégica.  
Mi código busca dejar huella, más allá de la pantalla.

---

## 💼 EXPERIENCIA PROFESIONAL

### **Allegro San Ángel Inn — Software Engineer**
*Septiembre 2025 … Actualmente*
- Contribución al desarrollo de un sistema de gestión financiera para una notaría, diseñando soluciones de software personalizadas para optimizar las operaciones y los reportes.
- Apoyo en la implementación e integración de nuevas tecnologías para modernizar los procesos internos y mejorar la eficiencia digital de la empresa.

### **Microsoft — Full Stack Developer**
*Septiembre 2023 - Noviembre 2023*
- Programa de formación de desarrolladores Full-Stack por Launch-X.
- Tecnologías utilizadas: FrontEnd (HTML, CSS, JAVASCRIPT, VUE JS, Nodejs), BackEnd (Mysql, Mongodb, Azure).

### **Accenture / JA México — Full Stack Developer**
*Agosto 2022 - Diciembre 2022*
- Objetivo del programa: Generar un proyecto de aplicación tecnológica móvil (una App), mediante la aplicación de herramientas especializadas que fundamenten la creación de este, para que el participante conozca y comprenda el proceso y los elementos que se deben considerar para la elaboración de un proyecto integral.

### **JA México — Developer**
*Abril 2022 - Julio 2022*
- En este programa se retomaron temas y tecnologías para elaborar un sitio web, se apoyó a los diferentes compañeros en la creación de sus primeras páginas web tomando como base las tecnologías más básicas para iniciar HTML, CSS y JavaScript.

---

## 🎓 ESTUDIOS Y CERTIFICACIONES

### **Estudios Universitarios & Posgrado**
- **Universidad Icel CDMX** — Maestría en Mercadotecnia | *Mayo 2022 - Abril 2023*
- **Universidad Icel CDMX** — Ingeniería en Sistemas Computacionales | *Septiembre 2017 - Agosto 2020*
- **Future Learning Ireland, Dublin** — Curso intensivo de inglés nivel B1, Trinity ISE | *Octubre 2024 - Mayo 2025*

### **Certificaciones**
- **Desarrollo Web** por GOOGLE (02/10/2022)
- **Creación de Filtros Faciales para Instagram con SPARK AR** por PLATZI (18/01/2022)
- **Introducción a la Ciberseguridad** por CISCO (22/10/2021)
- **NDG LINUX ESSENTIAL** por CISCO (17/05/2021)

---

## 🛠️ HABILIDADES

- **Lenguajes & Tecnologías:** HTML, CSS, JavaScript, React, Python, PHP, C++, Linux Shell, Spark AR.
- **Habilidades Blandas:** Trabajo en equipo, Liderazgo, Autodidacta, Comunicación efectiva.

---

## 🌍 IDIOMAS

- **Español:** Nativo
- **Inglés:** Nivel B1 (Moderado)
`
};

const CvPage = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'es' || paramLang === 'en') {
      setLang(paramLang);
      if (i18n.language !== paramLang) {
        i18n.changeLanguage(paramLang);
      }
    } else if (i18n.language && i18n.language.startsWith('es')) {
      setLang('es');
    } else {
      setLang('en');
    }
  }, [i18n]);

  const handleCopy = async () => {
    const textToCopy = cvData[lang];
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadMd = () => {
    const filename = lang === 'es' ? 'Imanol_Perez_Arteaga_CV_ES.md' : 'Imanol_Perez_Arteaga_CV_EN.md';
    const blob = new Blob([cvData[lang]], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const pdfUrl = lang === 'es' ? '/resources/CvEsp_Imanol Perez Arteaga.pdf' : '/resources/CvIng_Imanol Perez Arteaga.pdf';
    const filename = lang === 'es' ? 'Imanol_Perez_Arteaga_CV_ES.pdf' : 'Imanol_Perez_Arteaga_CV_EN.pdf';
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const switchLang = (newLang) => {
    setLang(newLang);
    if (i18n.changeLanguage) {
      i18n.changeLanguage(newLang);
    }
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans py-6 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Top Navigation & Action Bar - Optimized for Mobile & Desktop */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 dark:border-gray-800 pb-5">
        {/* Top Row on Mobile: Back button + Language Switcher */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t('cvPage.back-home', 'Volver al sitio')}</span>
          </a>

          {/* Language Switcher Pill */}
          <div className="inline-flex items-center gap-1 bg-gray-200/80 dark:bg-[#161b22] p-1 rounded-full border border-gray-300 dark:border-gray-800 shadow-inner">
            <button
              type="button"
              onClick={() => switchLang('en')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                lang === 'en'
                  ? 'bg-gray-900 text-white dark:bg-[#238636] dark:text-white shadow-sm'
                  : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLang('es')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                lang === 'es'
                  ? 'bg-gray-900 text-white dark:bg-[#238636] dark:text-white shadow-sm'
                  : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Premium Action Buttons: 3-column symmetrical grid on Mobile, flex on Desktop */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Copy MD */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full bg-white dark:bg-[#21262d] hover:bg-gray-100 dark:hover:bg-[#30363d] text-xs sm:text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 shadow-sm transition-colors cursor-pointer min-h-[42px]"
            title="Copiar Markdown al portapapeles"
          >
            {copied ? <Check size={15} className="text-green-600 dark:text-green-400 shrink-0" /> : <Copy size={15} className="shrink-0" />}
            <span className="truncate">{copied ? t('cvPage.copied', '¡Copiado!') : t('cvPage.copy-md', 'Copiar .md')}</span>
          </motion.button>

          {/* Download MD */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleDownloadMd}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full bg-white dark:bg-[#21262d] hover:bg-gray-100 dark:hover:bg-[#30363d] text-xs sm:text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 shadow-sm transition-colors cursor-pointer min-h-[42px]"
            title="Descargar archivo .md"
          >
            <Download size={15} className="shrink-0" />
            <span className="truncate">{t('cvPage.download-md', 'Descargar .md')}</span>
          </motion.button>

          {/* Download PDF - Primary Accent */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white dark:bg-[#238636] dark:hover:bg-[#2ea043] text-xs sm:text-sm font-bold border border-gray-900 dark:border-green-600 shadow-sm transition-colors cursor-pointer min-h-[42px]"
            title="Descargar archivo PDF oficial"
          >
            <FileText size={15} className="shrink-0" />
            <span className="truncate">{t('cvPage.download-pdf', 'Descargar PDF')}</span>
          </motion.button>
        </div>
      </div>

      {/* Markdown Document Container - Responsive Padding & Word Wrap for Mobile */}
      <motion.div
        key={lang}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto bg-white dark:bg-[#161b22] border border-gray-300 dark:border-gray-800 rounded-2xl p-4 sm:p-8 lg:p-10 shadow-xl dark:shadow-2xl overflow-x-auto leading-relaxed"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400">
          <span className="truncate">{lang === 'es' ? 'imanol_perez_cv.es.md' : 'imanol_perez_cv.en.md'}</span>
          <span className="shrink-0">Markdown Document</span>
        </div>

        <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm md:text-base text-gray-900 dark:text-[#e6edf3] font-medium selection:bg-blue-100 dark:selection:bg-blue-900/40">
          {cvData[lang]}
        </pre>
      </motion.div>
    </div>
  );
};

export default withProviders(CvPage);
