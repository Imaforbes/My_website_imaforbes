import withProviders from '../components/withProviders.jsx';
// src/pages/ProjectsPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";
import { useTranslation } from "react-i18next";
import { FiGithub, FiExternalLink, FiBriefcase, FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * HeroBackground Component
 * Provides a subtle, animated glowing background with a faint grid
 */
const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    
    {/* Subtle animated gradient glow */}
    <motion.div 
      initial={{ opacity: 0.1, scale: 0.9 }}
      animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '60vw', 
        height: '60vw', 
        background: 'radial-gradient(circle, rgba(150,150,150,0.03) 0%, rgba(0,0,0,0) 60%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}
    />
    
    {/* Grid pattern very faint */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(100,100,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
      maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
    }} />
  </div>
);

const ProjectCard = ({ project, t, setPreviewImage }) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const images = (project.images && project.images.length > 0) ? project.images : [project.image];
  const currentImg = images[currentImgIdx];

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
      <motion.div variants={cardVariants} className="project-card-premium h-full" style={{ zIndex: 10 }}>
      
      {/* Background Image / Carousel Container */}
      <div 
        className="cursor-pointer group relative"
        style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative', background: '#0B0C0F', borderBottom: '1px solid var(--color-border)' }}
        onClick={() => setPreviewImage && setPreviewImage(currentImg)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImgIdx}
            src={currentImg}
            alt={`${t(project.titleKey)} - ${currentImgIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
            decoding="async"
            className="grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        </AnimatePresence>

        {/* Carousel Navigation if multiple images */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 text-text p-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              title="Previous screenshot"
            >
              <FiChevronLeft size={18} />
            </button>
            <button 
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 text-text p-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              title="Next screenshot"
            >
              <FiChevronRight size={18} />
            </button>

            {/* Indicator Dots */}
            <div 
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-background/50 px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIdx(idx);
                  }}
                  style={{
                    width: idx === currentImgIdx ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '4px',
                    background: idx === currentImgIdx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Container */}
      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="ecosystem-card-top" style={{ marginBottom: '0.85rem' }}>
          <span className="ecosystem-kicker">
            {project.tags?.[0] || "PROJECT"}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            #{String(project.id).padStart(2, '0')}
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.65rem, 2.2vw, 2rem)', fontWeight: 400, lineHeight: 1.06, marginBottom: '0.85rem', color: 'var(--color-text)' }}>
          {t(project.titleKey)}
        </h3>
        
        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.68, marginBottom: '1.5rem', flexGrow: 1 }}>
          {t(project.descriptionKey)}
        </p>
        
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
            {project.tags.map((tag, i) => (
              <span key={i} className="project-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="project-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          {project.repo && project.repo !== "#" && (
            <BorderBeam theme="dark" size="sm" duration={4} colorVariant="mono" className="rounded-full">
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="ecosystem-cta"
                onClick={(e) => e.stopPropagation()}
              >
                <FiGithub size={14} /> <span>{t("projects.view_code", "VIEW CODE")}</span>
              </a>
            </BorderBeam>
          )}

          {project.link && project.link !== "#" && (
            <BorderBeam theme="dark" size="sm" duration={4} colorVariant="mono" className="rounded-full">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ecosystem-cta"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={14} /> <span>{t("projects.discover", "DISCOVER")}</span>
              </a>
            </BorderBeam>
          )}
        </div>
      </div>
      </motion.div>
  );
};

/**
 * ProjectsPage Component
 * Displays the portfolio of projects in a grid layout
 */
const ProjectsPage = () => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState(null);

  const projects = [
    {
      id: 9,
      titleKey: "projects.worldcup-app.title",
      descriptionKey: "projects.worldcup-app.description",
      image: "/img/Proy9.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/Quiniela_Mundial_2026",
      tags: ["React", "Vite", "Supabase", "PostgreSQL", "Vanilla CSS"],
    },
    {
      id: 8,
      titleKey: "projects.notary-system.title",
      descriptionKey: "projects.notary-system.description",
      image: "/img/Proy8.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/Sistema_Notarial_CRM",
      tags: ["React 19", "Flask", "MySQL", "Chart.js", "React-PDF"],
    },
    {
      id: 7,
      titleKey: "projects.restaurant-system.title",
      descriptionKey: "projects.restaurant-system.description",
      image: "/img/Proy7.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/restaurant-management-system",
      tags: ["React", "Supabase", "Tailwind CSS", "Mobile First"],
    },
    {
      id: 1,
      titleKey: "projects.hotel-system.title",
      descriptionKey: "projects.hotel-system.description",
      image: "/img/Proy1.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/Hotel-Safaris",
      tags: ["PHP 8", "MySQL PDO", "AJAX", "JavaScript ES6", "Bootstrap 5", "RBAC", "Bcrypt"],
    },
    {
      id: 2,
      titleKey: "projects.grinch-animation.title",
      descriptionKey: "projects.grinch-animation.description",
      image: "/img/Proy2.webp",
      link: "https://imaforbes.github.io/grinch_animado/",
      repo: "https://github.com/Imaforbes/grinch_animado",
      tags: ["HTML5", "CSS3 Keyframes", "JavaScript ES6", "Interactive UI", "Glassmorphism"],
    },
    {
      id: 3,
      titleKey: "projects.freelancer-portfolio.title",
      descriptionKey: "projects.freelancer-portfolio.description",
      image: "/img/Proy3.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/freelancer_portfolio",
      tags: ["HTML5", "CSS3"],
    },
    {
      id: 4,
      titleKey: "projects.responsive-landing.title",
      descriptionKey: "projects.responsive-landing.description",
      image: "/img/Proy4.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/FrontEndStore",
      tags: ["HTML5", "CSS3", "Responsive"],
    },
    {
      id: 5,
      titleKey: "projects.vaccination-page.title",
      descriptionKey: "projects.vaccination-page.description",
      image: "/img/Proy5.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/pagina_vacunacion",
      tags: ["HTML5", "CSS3"],
    },
    {
      id: 6,
      titleKey: "projects.pokedex.title",
      descriptionKey: "projects.pokedex.description",
      image: "/img/Proy6.webp",
      link: "#",
      repo: "https://github.com/Imaforbes/pokedex",
      tags: ["HTML5", "CSS3", "JavaScript", "PokeApi"],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <section id="proyectos" className="projects-section" style={{ position: 'relative', overflow: 'hidden' }}>
      <HeroBackground />
      <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
        
        <motion.div 
          className="projects-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', paddingTop: '0rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <div className="brand-lockup">
              <span className="brand-name">
                <FiBriefcase size={13} /> PORTFOLIO
              </span>
              <span className="brand-context">
                {projects.length} {t("projects.count-label", "Proyectos")}
              </span>
            </div>
          </div>

          <h1 className="projects-title">
            {t("projects.title")}
          </h1>
          <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'clamp(1rem, 1.45vw, 1.2rem)', lineHeight: 1.7 }}>
            {t("projects.description")}
          </p>
        </motion.div>
        
        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} t={t} setPreviewImage={setPreviewImage} />
          ))}
        </motion.div>

        {/* View All Repositories CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', marginBottom: '2rem' }}
        >
          <BorderBeam theme="dark" size="md" duration={5} colorVariant="mono" className="rounded-full">
            <a
              href="https://github.com/Imaforbes?tab=repositories&q=&type=&language=&sort="
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium"
              style={{
                padding: '0.95rem 2.2rem',
                borderRadius: '9999px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                border: '1px solid var(--color-text)',
              }}
            >
              <FiGithub size={16} />
              <span>{t("projects.view_all_repos", "VIEW ALL REPOSITORIES ON GITHUB")}</span>
            </a>
          </BorderBeam>
        </motion.div>
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '2rem' }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '1200px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
              />
              <button
                aria-label="Close preview"
                onClick={() => setPreviewImage(null)}
                style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem', background: 'var(--color-surface)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default withProviders(ProjectsPage);
