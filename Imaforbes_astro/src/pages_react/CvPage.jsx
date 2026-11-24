// src/pages_react/CvPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext.jsx';
import withProviders from '../components/withProviders.jsx';

const cvData = {
    en: `# IMANOL PEREZ ARTEAGA
**SOFTWARE ENGINEER | FULL-STACK DEVELOPER**

📍 Mexico City, Mexico  
✉️ imanol@imaforbes.com  
🌐 https://www.imaforbes.com  
💼 https://www.linkedin.com/in/imanol-pérez-arteaga-a72a08235  
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

📍 Ciudad de México, México  
✉️ imanol@imaforbes.com  
🌐 https://www.imaforbes.com  
💼 https://www.linkedin.com/in/imanol-pérez-arteaga-a72a08235  
💻 https://github.com/Imaforbes  

---

## 🚀 RESUMEN PROFESIONAL
Ingeniero de Software con experiencia construyendo aplicaciones web y empresariales robustas, con formación en Ingeniería en Sistemas Computacionales y Maestría en Mercadotecnia. Experiencia en desarrollo full-stack, ingeniería backend, diseño de bases de datos, arquitectura de sistemas, automatización de procesos, sistemas financieros, gestión de flujos de trabajo e infraestructura TI. Dominio de Python, FastAPI, React, JavaScript, SQL, PHP y despliegue en la nube. Capacidad comprobada para traducir requerimientos operativos complejos en soluciones de software seguras y escalables que digitalizan procesos manuales, centralizan información de negocio y mejoran la eficiencia operativa.

---

## 🛠️ HABILIDADES TÉCNICAS
- **Lenguajes de Programación:** Python, JavaScript, PHP, C++
- **Desarrollo Frontend:** React, Astro, HTML5, CSS3, Tailwind CSS, Diseño Web Responsivo
- **Backend y APIs:** FastAPI, Flask, Node.js, REST APIs, Desarrollo Backend
- **Bases de Datos:** SQL, MySQL, PostgreSQL, MongoDB, Supabase, Diseño y Administración de Bases de Datos
- **Nube y Despliegue:** Vercel, Microsoft Azure, Supabase
- **Ingeniería de Software:** Desarrollo Full-Stack, Arquitectura e Integración de Sistemas, Automatización de Procesos y Flujos de Trabajo
- **Sistemas e Infraestructura:** Linux, Bash, Arquitectura de Redes, VLANs, Diagnóstico de Sistemas
- **Herramientas y Automatización:** Git, GitHub, Terminal, FFmpeg, Google AI Studio / Gemini API

---

## 💼 EXPERIENCIA PROFESIONAL

### **ALLEGRO SAN ÁNGEL INN / GRUPO CORPORATIVO**
**Lead Software Engineer** | *Septiembre 2025 – Presente*
- Lidero el desarrollo integral de un sistema CRM y de gestión operativa y financiera a medida para modernizar flujos de trabajo legales y administrativos. Diseñé una arquitectura robusta con seguimiento automatizado de prospectos, envío inteligente de correos y redacción asistida por IA con Google Gemini. Construí un frontend responsivo de alto rendimiento con animaciones dinámicas, integrado con un backend seguro en Python y base de datos relacional para gestionar portafolios jurídicos, operaciones inmobiliarias y control financiero.
- **Tecnologías:** React, JavaScript, Vite, CSS / Bootstrap, Framer Motion, Python, Flask, Google Gemini AI, MySQL, Linux Shell, REST APIs, SMTP

### **PROYECTOS INDEPENDIENTES Y CONSULTORÍA**
**Full-Stack Developer & Technical IT Project Manager** | *Mayo 2026 – Presente*
- **Quiniela Mundial FIFA 2026:** Lanzamiento en producción de una aplicación web interactiva para pronósticos del Mundial 2026, desarrollando el frontend con React, backend y base de datos en tiempo real con Supabase, y despliegue continuo en Vercel.
- **Procesamiento Automatizado de Capacitaciones con IA:** Automatización del procesamiento de sesiones de capacitación de software, extrayendo audio mediante scripts de FFmpeg/Linux y generando resúmenes ejecutivos consolidados con Google AI Studio API.
- **Consultoría TI para Cine Independiente:** Evaluación técnica y financiera de soluciones de infraestructura, taquilla (POS), dulcería y operación para operadores independientes.

### **EXPERIENCIA PROFESIONAL TEMPRANA**

#### **JA MÉXICO**
**Full-Stack Developer** | *Septiembre 2023 – Noviembre 2023*
- Apoyé a los participantes en el lanzamiento de sus primeras páginas web operativas, brindando mentoría práctica en desarrollo, depuración e implementación con HTML, CSS y JavaScript.

#### **MICROSOFT — PROGRAMA LAUNCH-X**
**Full-Stack Developer** | *Agosto 2022 – Diciembre 2022*
- Desarrollé un proyecto de aplicación full-stack integrando componentes de frontend, backend, bases de datos y nube con JavaScript, Vue.js, Node.js, MySQL, MongoDB y Microsoft Azure.

#### **ACCENTURE / JA MÉXICO**
**Developer** | *Abril 2022 – Julio 2022*
- Desarrollé un prototipo funcional de tecnología móvil aplicando herramientas de ingeniería de software y metodologías de diseño de producto durante todo el ciclo de vida del proyecto.

---

## 🎓 EDUCACIÓN

### **UNIVERSIDAD ICEL**
- **Maestría en Mercadotecnia** | *Mayo 2022 – Abril 2023*
- **Ingeniería en Sistemas Computacionales** | *Septiembre 2017 – Agosto 2020*

---

## 📜 CERTIFICACIONES Y DESARROLLO PROFESIONAL
- **Intensive English Course — Trinity ISE** | Future Learning Ireland, Dublín | *Octubre 2024 – Mayo 2025*
- **Desarrollo Web** | Google | *Octubre 2022*
- **Creación de Filtros Faciales para Instagram con Spark AR** | Platzi | *Enero 2022*
- **Introducción a la Ciberseguridad** | Cisco | *Octubre 2021*
- **NDG Linux Essentials** | Cisco | *Mayo 2021*

---

## 🌍 IDIOMAS
- **Español:** Nativo
- **Inglés:** B2 — Intermedio-Alto (Upper-Intermediate)
`
};

const CvPage = () => {
  const { t, i18n } = useTranslation();
  const { language, updateLanguage } = useSettings();
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'es' || paramLang === 'en') {
      setLang(paramLang);
      if (i18n.language !== paramLang) {
        updateLanguage(paramLang);
      }
    } else if (language && language.startsWith('es')) {
      setLang('es');
    } else {
      setLang('en');
    }
  }, [i18n, language, updateLanguage]);

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
    updateLanguage(newLang);
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans py-6 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Top Navigation & Action Bar - Optimized for Mobile & Desktop */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-strong dark:border-strong pb-5">
        {/* Top Row on Mobile: Back button + Language Switcher */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text hover:text-text dark:text-text-muted dark:hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t('cvPage.back-home', 'Volver al sitio')}</span>
          </a>

          {/* Language Switcher Pill */}
          <div className="inline-flex items-center gap-1 bg-surface p-1 rounded-full border border-border shadow-inner">
            <button
              type="button"
              onClick={() => switchLang('en')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                lang === 'en'
                  ? 'bg-background text-text shadow-sm border border-border'
                  : 'text-text hover:text-text dark:text-text-muted dark:hover:text-text'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLang('es')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                lang === 'es'
                  ? 'bg-background text-text shadow-sm border border-border'
                  : 'text-text hover:text-text dark:text-text-muted dark:hover:text-text'
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Premium Action Buttons: 3-column symmetrical grid on Mobile, flex on Desktop */}
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Copy MD */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCopy}
            className="btn-premium btn-premium-surface inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm cursor-pointer min-h-[42px]"
            title="Copiar Markdown al portapapeles"
          >
            {copied ? <Check size={15} className="text-green-600 dark:text-green-400 shrink-0" /> : <Copy size={15} className="shrink-0" />}
            <span>{copied ? t('cvPage.copied', '¡Copiado!') : t('cvPage.copy-md', 'Copiar .md')}</span>
          </motion.button>

          {/* Download MD */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleDownloadMd}
            className="btn-premium btn-premium-surface inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm cursor-pointer min-h-[42px]"
            title="Descargar archivo .md"
          >
            <Download size={15} className="shrink-0" />
            <span>{t('cvPage.download-md', 'Descargar .md')}</span>
          </motion.button>

          {/* Download PDF - Primary Accent */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleDownloadPdf}
            className="btn-premium btn-premium-solid inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm cursor-pointer min-h-[42px]"
            title="Descargar archivo PDF oficial"
          >
            <FileText size={15} className="shrink-0" />
            <span>{t('cvPage.download-pdf', 'Descargar PDF')}</span>
          </motion.button>
        </div>
      </div>

      {/* Markdown Document Container - Responsive Padding & Word Wrap for Mobile */}
      <motion.div
        key={lang}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto bg-surface border border-border rounded-2xl p-4 sm:p-8 lg:p-10 shadow-xl overflow-x-auto leading-relaxed"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-strong dark:border-strong text-xs font-semibold text-text dark:text-text-muted">
          <span >{lang === 'es' ? 'imanol_perez_cv.es.md' : 'imanol_perez_cv.en.md'}</span>
          <span className="shrink-0">Markdown Document</span>
        </div>

        <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm md:text-base text-text font-medium">
          {cvData[lang]}
        </pre>
      </motion.div>
    </div>
  );
};

export default withProviders(CvPage);
