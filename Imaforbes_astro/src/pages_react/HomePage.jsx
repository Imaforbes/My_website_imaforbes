import withProviders from '../components/withProviders.jsx';
// src/pages/HomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";

import { FiArrowRight, FiMail, FiCode, FiTerminal, FiLayout, FiServer } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-light)' }} className="dark:hidden"></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg-dark)' }} className="hidden dark:block"></div>
    
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
          <BorderBeam theme="auto" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '50px', 
              background: 'var(--color-surface-light)',
              border: '1px solid var(--color-border-light)',
              fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted-light)',
              position: 'relative'
            }} className="dark:bg-[#111] dark:border-gray-800">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              Available for new opportunities
            </div>
          </BorderBeam>
        </motion.div>

        <motion.h1 variants={itemVariants} className="hero-title" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {t("home.title")}
        </motion.h1>

        <motion.h2 variants={itemVariants} className="hero-subtitle" style={{ fontSize: 'clamp(0.9rem, 2.8vw, 1.8rem)', marginTop: '1rem', whiteSpace: 'nowrap' }}>
          {t("home.subtitle")}
        </motion.h2>

        <motion.p variants={itemVariants} className="hero-description" style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>
          {t("home.description")}
        </motion.p>

        <motion.div variants={itemVariants} className="hero-actions" style={{ marginTop: '2.5rem' }}>
          <BorderBeam theme="auto" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/projects" className="btn-premium dark:bg-[#111] dark:border-gray-800" style={{ padding: '0.75rem 1.75rem', borderRadius: '9999px', background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)' }}>
              <span className="btn-icon">
                <FiCode /> {t("home.view-projects")} <FiArrowRight />
              </span>
            </a>
          </BorderBeam>
          
          <BorderBeam theme="auto" size="sm" duration={3} colorVariant="mono" className="rounded-full">
            <a href="/contact" className="btn-premium dark:bg-[#111] dark:border-gray-800" style={{ padding: '0.75rem 1.75rem', borderRadius: '9999px', background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: 'var(--color-text-muted-light)' }}>
              <span className="btn-icon">
                <FiMail /> {t("home.contact")}
              </span>
            </a>
          </BorderBeam>
        </motion.div>

        {/* Floating Skills/Tags to add life */}
        <motion.div 
          variants={itemVariants} 
          style={{ 
            marginTop: '4rem', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            flexWrap: 'wrap',
            opacity: 0.7
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
            <FiTerminal size={14} /> <span>Frontend</span>
          </div>
          <span style={{ color: 'var(--color-border-light)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
            <FiServer size={14} /> <span>Backend</span>
          </div>
          <span style={{ color: 'var(--color-border-light)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
            <FiLayout size={14} /> <span>UI/UX Design</span>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default withProviders(HomePage);
