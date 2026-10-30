import withProviders from '../components/withProviders.jsx';
// src/pages/AboutPage.jsx
/**
 * AboutPage - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds
 * - Changed from colorful gradients to neutral colors (black/white/grays)
 * - Updated typography: font-light for refined feel
 * - Added text reflection effects to section titles
 * - Updated skills cards: clean white/dark cards with subtle borders
 * - Changed progress bars: minimalist black/white instead of colorful gradients
 * - Updated timeline: clean gray line instead of colorful gradient
 * - Simplified all animations and removed colorful accents
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";
import { useTranslation } from "react-i18next";
import { Briefcase, Calendar, MapPin, ChevronRight, ChevronLeft, Grid, LayoutTemplate, Server, Database, Cloud, Wrench } from "lucide-react";
import { openCvModal } from "../utils/cvModal.js";
import { api } from "../services/api.js";
import {
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPhp,
  FaLinux,
  FaReact,
  FaNode,
  FaGitAlt,
  FaPython,
  FaGithub,
  FaNpm,
  FaBootstrap,
  FaSass,
} from "react-icons/fa";
import {
  SiTailwindcss,
  SiMysql,
  SiMongodb,
  SiVite,
  SiPostman,
  SiFigma,
  SiApache,
} from "react-icons/si";


const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    
    {/* Subtle animated gradient glow */}
    <motion.div 
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{ 
        position: 'absolute', 
        top: '20%', 
        left: '20%', 
        transform: 'translate(-50%, -50%)', 
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

const AboutPage = () => {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // Fetch experiences from API
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoadingExperiences(true);
        const result = await api.experiences.getAll('published');
        
        // Check if result is successful and has data
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
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
        const fallbackExperiences = t("about.experience", { returnObjects: true });
        if (Array.isArray(fallbackExperiences)) {
          setExperiences(fallbackExperiences);
        } else {
          setExperiences([]);
        }
      } finally {
        setLoadingExperiences(false);
      }
    };

    fetchExperiences();
  }, [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 120 },
    },
    hover: {
      scale: 1.1,
      y: -10,
      transition: { type: "spring", damping: 8, stiffness: 200 },
    },
  };

  // Enhanced skills data with categories
  const skillsData = [
    // Frontend
    {
      name: "HTML5",
      icon: FaHtml5,
      level: 95,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/50",
      category: "frontend",
    },
    {
      name: "CSS3",
      icon: FaCss3Alt,
      level: 90,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/50",
      category: "frontend",
    },
    {
      name: "JavaScript",
      icon: FaJsSquare,
      level: 90,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/50",
      category: "frontend",
    },
    {
      name: "React",
      icon: FaReact,
      level: 85,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/50",
      category: "frontend",
    },
    {
      name: "Tailwind CSS",
      icon: SiTailwindcss,
      level: 85,
      color: "text-teal-400",
      bgColor: "bg-teal-400/20",
      borderColor: "border-teal-400/50",
      category: "frontend",
    },
    {
      name: "Bootstrap",
      icon: FaBootstrap,
      level: 80,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
      category: "frontend",
    },
    {
      name: "Sass",
      icon: FaSass,
      level: 75,
      color: "text-pink-500",
      bgColor: "bg-pink-500/20",
      borderColor: "border-pink-500/50",
      category: "frontend",
    },
    {
      name: "Vite",
      icon: SiVite,
      level: 80,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20",
      borderColor: "border-yellow-400/50",
      category: "frontend",
    },
    // Backend
    {
      name: "Node.js",
      icon: FaNode,
      level: 80,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/50",
      category: "backend",
    },
    {
      name: "PHP",
      icon: FaPhp,
      level: 85,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
      category: "backend",
    },
    {
      name: "Python",
      icon: FaPython,
      level: 70,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
      borderColor: "border-blue-400/50",
      category: "backend",
    },
    // Databases
    {
      name: "MySQL",
      icon: SiMysql,
      level: 85,
      color: "text-blue-600",
      bgColor: "bg-blue-600/20",
      borderColor: "border-blue-600/50",
      category: "database",
    },
    {
      name: "MongoDB",
      icon: SiMongodb,
      level: 75,
      color: "text-green-600",
      bgColor: "bg-green-600/20",
      borderColor: "border-green-600/50",
      category: "database",
    },
    // DevOps & Tools
    {
      name: "Linux",
      icon: FaLinux,
      level: 80,
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/20",
      borderColor: "border-yellow-600/50",
      category: "devops",
    },
    {
      name: "Git",
      icon: FaGitAlt,
      level: 85,
      color: "text-orange-600",
      bgColor: "bg-orange-600/20",
      borderColor: "border-orange-600/50",
      category: "devops",
    },
    {
      name: "Apache",
      icon: SiApache,
      level: 75,
      color: "text-red-600",
      bgColor: "bg-red-600/20",
      borderColor: "border-red-600/50",
      category: "devops",
    },
    // Tools
    {
      name: "GitHub",
      icon: FaGithub,
      level: 90,
      color: "text-text-muted",
      bgColor: "bg-surface/20",
      borderColor: "border-strong/50",
      category: "tools",
    },
    {
      name: "NPM",
      icon: FaNpm,
      level: 85,
      color: "text-red-600",
      bgColor: "bg-red-600/20",
      borderColor: "border-red-600/50",
      category: "tools",
    },
    {
      name: "Postman",
      icon: SiPostman,
      level: 80,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/50",
      category: "tools",
    },
    {
      name: "Figma",
      icon: SiFigma,
      level: 70,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
      category: "tools",
    },
  ];

  const categories = [
    { id: "all", name: t("about.skills-filter-all"), icon: <Grid size={16} /> },
    { id: "frontend", name: t("about.skills-filter-frontend"), icon: <LayoutTemplate size={16} /> },
    { id: "backend", name: t("about.skills-filter-backend"), icon: <Server size={16} /> },
    { id: "database", name: t("about.skills-filter-database"), icon: <Database size={16} /> },
    { id: "devops", name: t("about.skills-filter-devops"), icon: <Cloud size={16} /> },
    { id: "tools", name: t("about.skills-filter-tools"), icon: <Wrench size={16} /> },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const aboutImages = ["/img/me4.webp", "/img/me.webp", "/img/me2.webp", "/img/me3.webp"];

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? aboutImages.length - 1 : prev - 1));
  };

  // Filter skills by category
  const filteredSkills = selectedCategory === "all"
    ? skillsData
    : skillsData.filter(skill => skill.category === selectedCategory);

  return (
    <section id="sobre-mi" className="about-section" style={{ position: 'relative', overflow: 'hidden' }}>
      <HeroBackground />
      <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
        
        <div className="bento-grid" style={{ marginBottom: '6rem', alignItems: 'stretch' }}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bento-item-small"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              overflow: 'visible',
            }}
          >
            {/* Single unified card container without double frame or clipped badges */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
              <div 
                className="card-premium" 
                style={{
                  padding: '0.6rem',
                  borderRadius: '2rem',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={nextImage}
              >
                {/* Inner image viewport with clean rounded clipping */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 4',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    background: '#0a0907',
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={aboutImages[currentImageIndex]}
                      alt="Imanol Pérez Arteaga"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'block', 
                        filter: 'contrast(1.04) saturate(1.05)',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                      }}
                    />
                  </AnimatePresence>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevImage}
                    aria-label="Anterior imagen"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      background: 'rgba(10, 9, 7, 0.55)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 3,
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button 
                    onClick={nextImage}
                    aria-label="Siguiente imagen"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '12px',
                      transform: 'translateY(-50%)',
                      background: 'rgba(10, 9, 7, 0.55)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 3,
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Gradient overlay contained strictly inside the inner image viewport */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '72px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }} />

                  {/* Carousel Indicators */}
                  <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 3 }}>
                    {aboutImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Ver foto ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        style={{
                          width: idx === currentImageIndex ? '22px' : '8px',
                          height: '8px',
                          padding: 0,
                          border: 'none',
                          borderRadius: '4px',
                          background: idx === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 - Top Left (never clipped) */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1rem',
                  zIndex: 4,
                  background: 'var(--color-surface)',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border-strong)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', flexShrink: 0 }}>
                  <FaReact size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stack</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 600, whiteSpace: 'nowrap' }}>MERN / PHP</span>
                </div>
              </motion.div>

              {/* Floating Badge 2 - Bottom Right (never clipped) */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ 
                  position: 'absolute',
                  bottom: '2.75rem',
                  right: '1rem',
                  zIndex: 4,
                  background: 'var(--color-surface)',
                  padding: '0.65rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border-strong)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '1.05rem', color: 'var(--color-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t("about.experience-years", "+3 Años")}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{t("about.experience-label", "Experiencia Full Stack")}</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bento-item bento-item-medium"
            style={{ justifyContent: 'center' }}
          >
            <span className="section-label">{t("about.section-label", "ABOUT · EDITORIAL PROFILE")}</span>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', marginBottom: '1.5rem', textAlign: 'left', lineHeight: 1.02 }}>
              {t("about.hero-title")}
            </h1>
            <p className="text-muted" style={{ fontSize: '1.08rem', lineHeight: 1.75, marginBottom: '1.25rem', fontWeight: 400 }}>
              {t("about.hero-text-1")}
            </p>
            <p className="text-muted" style={{ fontSize: '1.08rem', lineHeight: 1.75, marginBottom: '2.25rem', fontWeight: 400 }}>
              {t("about.hero-text-2")}
            </p>

            <BorderBeam theme="dark" size="sm" duration={3} colorVariant="mono" className="rounded-full w-max">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  openCvModal();
                }}
                className="btn-premium"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.85rem 1.85rem',
                  borderRadius: '9999px',
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                  border: '1px solid var(--color-text)',
                  cursor: 'pointer',
                  minHeight: '46px',
                }}
              >
                {t("about.download-cv")}
              </button>
            </BorderBeam>
          </motion.div>
        </div>

        <div className="skills-container" id="habilidades">
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span className="section-label">{t("about.skills-eyebrow", "STACK & CAPABILITIES")}</span>
            <motion.h2
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="hero-title"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', textAlign: 'center', marginBottom: 0 }}
            >
              {t("about.skills-title")}
            </motion.h2>
          </div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2.5rem',
              padding: '0.5rem',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              width: 'fit-content',
              maxWidth: '100%',
              marginInline: 'auto',
              boxShadow: 'var(--shadow-pill)',
            }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`project-tag ${selectedCategory === category.id ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  background: selectedCategory === category.id ? 'var(--color-text)' : 'transparent',
                  color: selectedCategory === category.id ? 'var(--color-bg)' : 'var(--color-text-muted)'
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="skills-grid"
            >
              {filteredSkills.map((skill) => {
                const IconComponent = skill.icon;
                return (
                  <motion.div
                    key={skill.name}
                    variants={skillVariants}
                    className="skill-card"
                  >
                    <span className="ecosystem-icon" style={{ marginBottom: '0.85rem' }}>
                      <IconComponent size={20} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
                      {skill.name}
                    </span>
                    <div className="skill-progress-bar">
                      <motion.div
                        className="skill-progress-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="timeline-container" id="experiencia">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-label">{t("about.career-eyebrow", "CAREER LOG")}</span>
            <motion.h2
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="hero-title"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', textAlign: 'center', marginBottom: 0 }}
            >
              {t("about.experience-title")}
            </motion.h2>
          </div>

          <div style={{ position: 'relative', maxWidth: '840px', margin: '0 auto' }}>
            {loadingExperiences ? (
              <p className="text-muted" style={{ textAlign: 'center' }}>{t("about.experience-loading")}</p>
            ) : experiences.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center' }}>{t("about.experience-empty")}</p>
            ) : (
              experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  className="timeline-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="timeline-content card-premium" style={{ padding: '2rem' }}>
                    <div className="ecosystem-card-top" style={{ marginBottom: '1rem' }}>
                      <span className="ecosystem-icon" style={{ width: '38px', height: '38px' }}>
                        <Briefcase size={16} />
                      </span>
                      <span className="ecosystem-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} /> {exp.period}
                      </span>
                    </div>
                    
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                      {exp.title}
                    </h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{exp.company}</span>
                      {exp.location && (
                        <>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={12} /> {exp.location}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.68, marginBottom: '1.5rem' }}>
                      {exp.description}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="project-tags" style={{ marginBottom: 0 }}>
                        {exp.technologies.map((tech, idx) => (
                          <span key={idx} className="project-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default withProviders(AboutPage);
