// src/pages/ProjectsPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiGithub, FiExternalLink, FiBriefcase, FiAward } from "react-icons/fi";

/**
 * HeroBackground Component
 * Provides a subtle, animated glowing background with a faint grid
 */
const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-light)' }} className="dark:hidden"></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-dark)' }} className="hidden dark:block"></div>
    
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

/**
 * ProjectCard Component
 * Renders an individual project with a premium card design
 */
const ProjectCard = ({ project, t, setPreviewImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div variants={cardVariants} className="card-premium project-card" style={{ zIndex: 10, position: 'relative' }}>
      <div 
        className="project-image-container cursor-pointer"
        onClick={() => setPreviewImage && setPreviewImage(project.image)}
      >
        {!imageLoaded && !imageError && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '30px', height: '30px', border: '2px solid var(--color-border-light)', borderTopColor: 'var(--color-text-light)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}
        
        {imageError && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-muted">Image not available</span>
          </div>
        )}
        
        {!imageError && (
          <img
            src={project.image}
            alt={t(project.titleKey)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(false); }}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="project-content">
        <h3 style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: 'var(--color-text-light)' }}>
          {t(project.titleKey)}
        </h3>

        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {t(project.descriptionKey)}
        </p>

        <div className="project-actions">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <FiGithub size={18} />
            <span>Code</span>
          </a>

          {project.link && project.link !== "#" && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium"
              style={{ borderColor: 'var(--color-text-muted-light)', color: 'var(--color-text-muted-light)', background: 'transparent' }}
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink size={18} />
              <span>Live</span>
            </a>
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
      id: 8,
      titleKey: "projects.notary-system.title",
      descriptionKey: "projects.notary-system.description",
      image: "/img/Proy8.png",
      link: "#",
      repo: "#",
      tags: ["React 19", "Flask", "MySQL", "Chart.js", "React-PDF"],
    },
    {
      id: 7,
      titleKey: "projects.restaurant-system.title",
      descriptionKey: "projects.restaurant-system.description",
      image: "/img/Proy7.png",
      link: "#",
      repo: "https://github.com/Imaforbes/restaurant-management-system",
      tags: ["React", "Supabase", "Tailwind CSS", "Mobile First"],
    },
    {
      id: 1,
      titleKey: "projects.hotel-system.title",
      descriptionKey: "projects.hotel-system.description",
      image: "/img/Proy1.png",
      link: "#",
      repo: "https://github.com/Imaforbes/Hotel-Safaris",
      tags: ["PHP", "MySQL", "HTML5", "CSS", "JavaScript", "Bootstrap 5"],
    },
    {
      id: 2,
      titleKey: "projects.grinch-animation.title",
      descriptionKey: "projects.grinch-animation.description",
      image: "/img/Proy2.png",
      link: "#",
      repo: "https://github.com/Imaforbes/grinch_animado",
      tags: ["HTML5", "CSS3"],
    },
    {
      id: 3,
      titleKey: "projects.freelancer-portfolio.title",
      descriptionKey: "projects.freelancer-portfolio.description",
      image: "/img/Proy3.png",
      link: "#",
      repo: "https://github.com/Imaforbes/freelancer_portfolio",
      tags: ["HTML5", "CSS3"],
    },
    {
      id: 4,
      titleKey: "projects.responsive-landing.title",
      descriptionKey: "projects.responsive-landing.description",
      image: "/img/Proy4.png",
      link: "#",
      repo: "https://github.com/Imaforbes/FrontEndStore",
      tags: ["HTML5", "CSS3", "Responsive"],
    },
    {
      id: 5,
      titleKey: "projects.vaccination-page.title",
      descriptionKey: "projects.vaccination-page.description",
      image: "/img/Proy5.png",
      link: "#",
      repo: "https://github.com/Imaforbes/pagina_vacunacion",
      tags: ["HTML5", "CSS3"],
    },
    {
      id: 6,
      titleKey: "projects.pokedex.title",
      descriptionKey: "projects.pokedex.description",
      image: "/img/Proy6.png",
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
        
        {/* Floating Background Widgets */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '5%', right: '10%', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface-light)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--color-border-light)' }}
          className="dark:bg-[#1a1a1a] dark:border-gray-800"
        >
          <FiBriefcase style={{ color: 'var(--color-text-muted-light)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{projects.length} Proyectos</span>
        </motion.div>

        <motion.div 
          className="projects-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', paddingTop: '2rem' }}
        >
          <h1 className="projects-title">
            {t("projects.title")}
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
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
                onClick={() => setPreviewImage(null)}
                style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem', background: 'var(--color-surface-light)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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

export default ProjectsPage;