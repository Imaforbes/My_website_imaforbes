import withProviders from '../components/withProviders.jsx';
// src/pages/HomePage.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";

import { FiArrowRight, FiMail, FiCode, FiTerminal, FiLayout, FiServer, FiBriefcase } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    
    {/* Subtle animated gradient glow (Heliouz style for dark mode, very faint for light mode) */}
    <motion.div 
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.8, 1.1, 0.8] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '70vw', 
        height: '70vw', 
        background: 'radial-gradient(circle, rgba(150,150,150,0.04) 0%, rgba(0,0,0,0) 60%)',
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


const DynamicText = ({ texts }) => {
  const [index, React_useState] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      React_useState((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <span style={{ display: 'inline-flex', position: 'relative', height: '1.2em', overflow: 'hidden', verticalAlign: 'bottom', minWidth: '280px', justifyContent: 'center' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ position: 'absolute', whiteSpace: 'nowrap', color: 'var(--color-text)' }}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const HomePage = () => {

  const { t } = useTranslation();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0.5, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <section className="hero-premium" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <HeroBackground />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hero-content"
      >
        {/* Status Pill */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '50px', 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)',
              position: 'relative'
            }} className="dark:bg-[#111] dark:border-strong">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              {t("home.available", "Available for new opportunities")}
            </div>
          </BorderBeam>
        </motion.div>

        <motion.h1 variants={itemVariants} className="hero-title" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {t("home.title")}
        </motion.h1>

        <motion.h2 variants={itemVariants} className="hero-subtitle" style={{ fontSize: 'clamp(1rem, 2.8vw, 1.8rem)', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Especializado en</span>
          <DynamicText texts={[
            t("home.subtitle_1", "Desarrollo Web Moderno."),
            t("home.subtitle_2", "Diseño de Interfaces."),
            t("home.subtitle_3", "Soluciones Full Stack."),
            t("home.subtitle_4", "Arquitecturas Nube.")
          ]} />
        </motion.h2>

        <motion.p variants={itemVariants} className="hero-description" style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>
          {t("home.description")}
        </motion.p>

        <motion.div variants={itemVariants} className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginTop: '3rem' }}>
          {/* Primary CTA: Von Restorff Effect (Isolation) */}
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/projects" className="btn-premium shadow-lg" style={{ padding: '0.85rem 2rem', borderRadius: '9999px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', fontWeight: 600 }}>
              <span className="btn-icon">
                <FiCode /> {t("home.view-projects")} <FiArrowRight />
              </span>
            </a>
          </BorderBeam>
          
          {/* Secondary CTA: Hick's Law (Reduce cognitive load by de-emphasizing secondary options) */}
          <a href="/contact" className="btn-premium dark:hover:bg-[#111] hover:bg-surface transition-colors" style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <span className="btn-icon">
              <FiMail /> {t("home.contact")}
            </span>
          </a>

          {/* Tertiary CTA */}
          <a href="/trajectory" className="btn-premium dark:hover:bg-[#111] hover:bg-surface transition-colors" style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <span className="btn-icon">
              <FiBriefcase /> {t("home.view-trajectory")}
            </span>
          </a>
        </motion.div>

        {/* Floating Parallax Skills */}
        <motion.div variants={itemVariants} style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)', background: 'var(--color-surface)', padding: '0.6rem 1.2rem', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}
            className="dark:bg-[#111] dark:border-strong"
          >
            <FiTerminal size={14} className="text-emerald-500" /> <span>{t("home.tag_frontend", "Frontend")}</span>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)', background: 'var(--color-surface)', padding: '0.6rem 1.2rem', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}
            className="dark:bg-[#111] dark:border-strong"
          >
            <FiServer size={14} className="text-blue-500" /> <span>{t("home.tag_backend", "Backend")}</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)', background: 'var(--color-surface)', padding: '0.6rem 1.2rem', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}
            className="dark:bg-[#111] dark:border-strong"
          >
            <FiLayout size={14} className="text-purple-500" /> <span>{t("home.tag_uiux", "UI/UX Design")}</span>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default withProviders(HomePage);
