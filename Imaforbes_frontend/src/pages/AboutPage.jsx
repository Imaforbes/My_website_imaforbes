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
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
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
        
        // Debug logging (only in development)
        if (import.meta.env.DEV) {
          console.log('Experiences API result:', result);
        }
        
        // Check if result is successful and has data
        if (result.success && result.data) {
          // The API returns: { success: true, data: { success: true, data: [...] } }
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
          } else if (apiResponse.success && Array.isArray(apiResponse.data) && apiResponse.data.length === 0) {
            // Empty array is valid - no experiences yet
            setExperiences([]);
            return;
          }
        }
        
        // If we get here, API call didn't return expected format
        if (import.meta.env.DEV) {
          console.warn('Unexpected API response format, falling back to i18n');
        }
        
        // Fallback to i18n if API fails or returns unexpected format
        const fallbackExperiences = t("about.experience", { returnObjects: true });
        if (Array.isArray(fallbackExperiences)) {
          setExperiences(fallbackExperiences);
        } else {
          setExperiences([]);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
        // Fallback to i18n on error
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
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Filter skills by category
  const filteredSkills = selectedCategory === "all"
    ? skillsData
    : skillsData.filter(skill => skill.category === selectedCategory);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden"
    >
      <HeroBackground />
      {/* Ajuste de padding y max-w para diferentes tamaños de pantalla */}
      <div className="relative z-10 container mx-auto max-w-7xl py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Disposición responsiva de la sección "sobre-mi" */}
        <section
          id="sobre-mi"
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-12 sm:mb-16 lg:mb-20 xl:mb-32"
        >
          <motion.div
            variants={itemVariants}
            // Imagen ocupa 1 columna en móvil, 2 en pantallas medianas y más grandes
            className="lg:col-span-2"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src="/img/IMG_0029.JPG"
              alt="Imanol Pérez Arteaga"
              className="rounded-lg object-cover w-full h-auto md:h-full shadow-sm"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3">
            {/* Tamaño del título responsivo */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 leading-tight tracking-tight text-gray-900 dark:text-white text-reflection"
              data-text={t("about.hero-title")}
            >
              {t("about.hero-title")}
            </motion.h1>
            {/* Text styling */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 font-light">
              {t("about.hero-text-1")}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 sm:mb-8 font-light">
              {t("about.hero-text-2")}
            </p>

            {/* Download CV Button */}
            <a
              href="/resources/CvIng_Imanol Perez Arteaga.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-sm sm:text-base md:text-lg font-medium tracking-wide transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl"
            >
              {t("about.download-cv")}
            </a>
          </motion.div>
        </section>

        <section id="habilidades" className="mb-12 sm:mb-16 lg:mb-20 xl:mb-32">
          {/* Tamaño del título responsivo */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-center mb-6 sm:mb-8 tracking-tight text-gray-900 dark:text-white text-reflection"
            data-text={t("about.skills-title")}
          >
            {t("about.skills-title")}
          </motion.h2>

          {/* Category Filter Buttons */}
          {/* Responsive: Smaller gaps and padding on mobile */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10 px-2"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 border rounded-2xl ${
                  selectedCategory === category.id
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white"
                }`}
                whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Skills Grid with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            >
              {filteredSkills.map((skill, index) => {
                const IconComponent = skill.icon;
                return (
                  <motion.div
                    key={skill.name}
                    variants={skillVariants}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 bg-white dark:bg-[#0f0f0f] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setHoveredSkill(skill.name)}
                    onHoverEnd={() => setHoveredSkill(null)}
                    layout
                  >
                    {/* Animated background with skill color */}
                    <motion.div
                      className={`absolute inset-0 ${skill.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      initial={{ scale: 0 }}
                      animate={{ scale: hoveredSkill === skill.name ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Icon with skill color */}
                    {/* Responsive icon sizes */}
                    <motion.div
                      className={`${skill.color} mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-300 relative z-10`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent size={24} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                    </motion.div>

                    {/* Skill name - Responsive text sizing */}
                    <motion.p
                      className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 relative z-10 mb-1 sm:mb-2 leading-tight"
                      whileHover={{ scale: 1.02 }}
                    >
                      {skill.name}
                    </motion.p>

                    {/* Progress bar - Minimalist */}
                    <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-1 relative z-10 overflow-hidden">
                      <motion.div
                        className="h-full bg-black dark:bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                      />
                    </div>

                    {/* Skill level percentage - Responsive text size */}
                    <motion.span
                      className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-1.5 relative z-10 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
                    >
                      {skill.level}%
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Skills count */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6 font-light"
          >
            {t("about.skills-count", { count: filteredSkills.length, total: skillsData.length })}
          </motion.p>
        </section>

        {/* Work Experience Timeline Section */}
        <section id="experiencia" className="mb-12 sm:mb-16 lg:mb-20 xl:mb-32">
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-center mb-8 sm:mb-10 lg:mb-12 tracking-tight text-gray-900 dark:text-white text-reflection"
            data-text={t("about.experience-title")}
            style={{ overflow: 'hidden' }}
          >
            {t("about.experience-title")}
          </motion.h2>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline items */}
            <div className="space-y-8 sm:space-y-12 relative">
              {loadingExperiences ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400 font-light relative z-10">
                  {t("about.experience-loading")}
                </div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400 font-light relative z-10">
                  {t("about.experience-empty")}
                </div>
              ) : (
                <>
                  {/* Timeline line - Solo se muestra cuando hay experiencias */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700 transform md:-translate-x-1/2 -z-10"></div>
                  {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative pl-12 md:pl-0 md:flex md:items-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-2 md:left-1/2 w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black transform md:-translate-x-1/2 z-10"></div>

                  {/* Content card */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-8 md:text-right" : "md:ml-auto md:pl-8"}`}>
                    <motion.div
                      className="bg-white dark:bg-[#0f0f0f] rounded-sm p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-900 dark:hover:border-gray-600 transition-all duration-200 group"
                      whileHover={{ y: -2 }}
                    >
                      {/* Date */}
                      <div className={`flex items-center gap-2 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {exp.period}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {exp.title}
                      </h3>

                      {/* Company */}
                      <div className={`flex items-center gap-2 mb-4 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <Briefcase size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                          {exp.company}
                        </span>
                      </div>

                      {/* Location */}
                      {exp.location && (
                        <div className={`flex items-center gap-2 mb-4 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                          <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {exp.location}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 font-light">
                        {exp.description}
                      </p>

                      {/* Responsibilities */}
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <ul className={`space-y-2 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                          {exp.responsibilities.map((responsibility, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              {index % 2 === 0 ? (
                                <>
                                  <span className="md:order-2">{responsibility}</span>
                                  <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0 md:order-1 md:rotate-180" />
                                </>
                              ) : (
                                <>
                                  <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                  <span>{responsibility}</span>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Technologies */}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {exp.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium border border-gray-300 dark:border-gray-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.section>
  );
};

export default AboutPage;
