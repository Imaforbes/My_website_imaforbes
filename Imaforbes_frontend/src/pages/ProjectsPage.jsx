// src/pages/ProjectsPage.jsx
/**
 * ProjectsPage - Modern Minimalist & Deluxe Design
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiGithub, FiExternalLink } from "react-icons/fi";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const ProjectCard = ({ project, t, setPreviewImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
    hover: {
      scale: 1.01,
      y: -8,
      transition: { type: "spring", damping: 8, stiffness: 200 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative overflow-hidden bg-white dark:bg-[#0f0f0f] modern-border modern-shadow-md modern-card modern-hover"
      whileHover="hover"
    >
      {/* Container de la imagen */}
      <div 
        className="relative overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
        onClick={() => setPreviewImage && setPreviewImage(project.image)}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 z-10">
            <div className="w-8 h-8 border-2 border-gray-400 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError && (
          <div className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="text-gray-400 dark:text-gray-600 text-sm font-light">Image not available</span>
          </div>
        )}
        
        {!imageError && (
          <img
            src={project.image}
            alt={t(project.titleKey)}
            className={`w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 object-cover transition-all duration-500 ease-out group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Overlay gradiente - pointer-events-none para que no bloquee clics */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Texto de preview - pointer-events-none para que no bloquee clics */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-3 py-1.5 rounded-2xl">
            Click to preview
          </span>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5 sm:p-6 md:p-8 flex flex-col">
        <motion.h3
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 leading-tight"
        >
          {t(project.titleKey)}
        </motion.h3>

        <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-4 sm:mb-5">
          {project.tags.map((tag, index) => (
            <motion.span
              key={tag}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-2xl modern-shadow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 font-light leading-relaxed"
        >
          {t(project.descriptionKey)}
        </motion.p>

        {/* BOTONES - Ahora con z-index alto y sin overlays que los bloqueen */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-auto relative">
          
          {/* BOTÓN DE GITHUB - SIEMPRE VISIBLE */}
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-50 flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-sm sm:text-base font-medium transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl modern-shadow-md hover:modern-shadow-lg hover:scale-105 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              console.log('GitHub button clicked:', project.repo);
            }}
          >
            <FiGithub size={18} className="sm:w-5 sm:h-5" />
            <span>Code</span>
          </a>

          {/* BOTÓN LIVE (Solo si existe demo) */}
          {project.link && project.link !== "#" && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-50 flex items-center justify-center gap-2 px-5 sm:px-6 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm sm:text-base font-medium transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl modern-shadow-md hover:modern-shadow-lg hover:scale-105 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Live button clicked:', project.link);
              }}
            >
              <FiExternalLink size={18} className="sm:w-5 sm:h-5" />
              <span>Live</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsPage = () => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState(null);

  const projects = [
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
      transition: { staggerChildren: 0.15, delayChildren: 0.5 },
    },
  };

  return (
    <motion.section
      id="proyectos"
      className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeroBackground />
      <div className="relative z-10 container mx-auto max-w-7xl py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight tracking-tight text-gray-900 dark:text-white text-reflection"
            data-text={t("projects.title")}
          >
            {t("projects.title")}
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } },
            }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4 font-light"
          >
            {t("projects.description")}
          </motion.p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
          variants={containerVariants}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} t={t} setPreviewImage={setPreviewImage} />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Project preview"
                className="max-w-full max-h-full object-contain rounded-2xl modern-shadow-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl modern-shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default ProjectsPage;