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
import { useTranslation } from "react-i18next";
import { Briefcase, Calendar, MapPin, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
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
import { Briefcase, Calendar, MapPin, ArrowRight } from "lucide-react";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-light)' }} className="dark:hidden"></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-dark)' }} className="hidden dark:block"></div>
    
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
        if (result.success && result.data) {
          const apiResponse = result.data;
          
          if (apiResponse.success && Array.isArray(apiResponse.data)) {
            const experiencesData = apiResponse.data;
            // Sort by sort_order, then by created_at
            const sorted = experiencesData.sort((a, b) => {
              if (a.sort_order !== b.sort_order) {
                return a.sort_order - b.sort_order;
              }
              return new Date(b.created_at) - new Date(a.created_at);
            });
            setExperiences(sorted);
            return; // Success, exit early
          }
        }
        
        // Fallback to i18n
        const fallbackExperiences = t("about.experience", { returnObjects: true });
        if (Array.isArray(fallbackExperiences)) {
          setExperiences(fallbackExperiences);
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
      color: "text-gray-300",
      bgColor: "bg-gray-300/20",
      borderColor: "border-gray-300/50",
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
    { id: "all", name: t("about.skills-filter-all"), icon: "🔧" },
    { id: "frontend", name: t("about.skills-filter-frontend"), icon: "🎨" },
    { id: "backend", name: t("about.skills-filter-backend"), icon: "⚙️" },
    { id: "database", name: t("about.skills-filter-database"), icon: "🗄️" },
    { id: "devops", name: t("about.skills-filter-devops"), icon: "🚀" },
    { id: "tools", name: t("about.skills-filter-tools"), icon: "🛠️" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const aboutImages = ["/img/IMG_0029.JPG", "/img/me.jpeg"];

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
        
        <div className="about-grid" style={{ alignItems: 'center', marginBottom: '6rem' }}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
          >
            {/* Image Container with subtle hover and premium styling */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <div style={{ 
                position: 'absolute', 
                inset: '-10px', 
                background: 'linear-gradient(45deg, rgba(150,150,150,0.1), transparent, rgba(150,150,150,0.1))', 
                borderRadius: '24px', 
                filter: 'blur(15px)',
                zIndex: -1
              }}></div>
              
              <div 
                className="card-premium" 
                style={{ padding: '0.5rem', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                onClick={nextImage}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={aboutImages[currentImageIndex]}
                    alt="Imanol Pérez Arteaga"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      aspectRatio: '3 / 4',
                      borderRadius: '18px', 
                      display: 'block', 
                      filter: 'contrast(1.05) saturate(1.1)',
                      objectFit: 'cover'
                    }}
                  />
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <ChevronLeft size={20} />
                </button>

                <button 
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <ChevronRight size={20} />
                </button>

                {/* Gradient overlay for better indicator visibility */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '60px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                  borderRadius: '0 0 18px 18px',
                  pointerEvents: 'none',
                  zIndex: 1
                }}></div>

                {/* Carousel Indicators */}
                <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 2 }}>
                  {aboutImages.map((_, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: idx === currentImageIndex ? '20px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: idx === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  position: 'absolute', top: '10%', left: '-15%', 
                  background: 'var(--color-surface-light)',
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
                className="dark:bg-[#1a1a1a] dark:border-gray-800"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)' }} className="dark:bg-[#0a0a0a] dark:text-white">
                  <FaReact size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted-light)', fontWeight: 500, textTransform: 'uppercase' }}>Stack</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 600 }} className="dark:text-white">MERN / PHP</span>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ 
                  position: 'absolute', bottom: '15%', right: '-10%', 
                  background: 'var(--color-surface-light)',
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
                className="dark:bg-[#1a1a1a] dark:border-gray-800"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', fontWeight: 700 }} className="dark:text-white">+3 Años</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted-light)' }}>Experiencia Full Stack</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ paddingLeft: '2rem' }}
          >
            <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1.5rem', textAlign: 'left', lineHeight: 1.1 }}>
              {t("about.hero-title")}
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem', fontWeight: 300 }}>
              {t("about.hero-text-1")}
            </p>
            <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', fontWeight: 300 }}>
              {t("about.hero-text-2")}
            </p>

            <a
              href="/resources/CvIng_Imanol Perez Arteaga.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium"
              style={{ display: 'inline-flex' }}
            >
              {t("about.download-cv")}
            </a>
          </motion.div>
        </div>

        <div className="skills-container" id="habilidades">
          <motion.h2
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="hero-title"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', textAlign: 'center', marginBottom: '2rem' }}
          >
            {t("about.skills-title")}
          </motion.h2>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`project-tag ${selectedCategory === category.id ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer',
                  background: selectedCategory === category.id ? 'var(--color-text-light)' : 'transparent',
                  color: selectedCategory === category.id ? 'var(--color-bg-light)' : 'var(--color-text-muted-light)'
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
                    <IconComponent size={32} style={{ marginBottom: '1rem', color: 'var(--color-text-muted-light)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-light)' }} className="dark:text-white">
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
          <motion.h2
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="hero-title"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', textAlign: 'center', marginBottom: '4rem' }}
          >
            {t("about.experience-title")}
          </motion.h2>

          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted-light)' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.9rem' }}>{exp.period}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-light)' }} className="dark:text-white">
                      {exp.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-light)' }} className="dark:text-gray-300">
                      <Briefcase size={16} />
                      <span style={{ fontWeight: 500 }}>{exp.company}</span>
                    </div>

                    {exp.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted-light)' }}>
                        <MapPin size={16} />
                        <span style={{ fontSize: '0.9rem' }}>{exp.location}</span>
                      </div>
                    )}

                    <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
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
