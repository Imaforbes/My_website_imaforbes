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
        {/* Brand Lockup Pill (aibuilders.lat style + Imaforbes BorderBeam) */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.25rem' }}>
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="mono" className="rounded-full">
            <div className="brand-lockup">
              <span className="brand-name">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', flexShrink: 0 }} />
                IMAFORBES
              </span>
              <span className="brand-context">
                {t("home.available", "Available for new opportunities")}
              </span>
            </div>
          </BorderBeam>
        </motion.div>

        <motion.h1 variants={itemVariants} className="hero-title">
          {t("home.title")}
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="hero-subtitle"
          style={{
            fontSize: 'clamp(1.15rem, 2.6vw, 1.65rem)',
            marginTop: '1.25rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: ' baseline',
            gap: '0.45rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>Especializado en</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.18em', color: 'var(--color-text)' }}>
            <DynamicText texts={[
              t("home.subtitle_1", "Desarrollo Web Moderno."),
              t("home.subtitle_2", "Diseño de Interfaces."),
              t("home.subtitle_3", "Soluciones Full Stack."),
              t("home.subtitle_4", "Arquitecturas Nube.")
            ]} />
          </span>
        </motion.h2>

        <motion.p variants={itemVariants} className="hero-description" style={{ marginTop: '1.25rem' }}>
          {t("home.description")}
        </motion.p>

        <motion.div variants={itemVariants} className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          {/* Primary CTA: Von Restorff Effect (Isolation) */}
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="mono" className="rounded-full">
            <a href="/projects" className="btn-premium shadow-lg" style={{ padding: '0.9rem 1.85rem', borderRadius: '9999px', background: 'var(--color-text)', color: 'var(--color-bg)', border: '1px solid var(--color-text)' }}>
              <span className="btn-icon">
                <FiCode size={15} /> {t("home.view-projects")} <FiArrowRight size={15} />
              </span>
            </a>
          </BorderBeam>
          
          {/* Secondary CTA */}
          <a href="/contact" className="btn-premium" style={{ padding: '0.9rem 1.6rem', borderRadius: '9999px', background: 'var(--color-surface)' }}>
            <span className="btn-icon">
              <FiMail size={15} /> {t("home.contact")}
            </span>
          </a>

          {/* Tertiary CTA */}
          <a href="/trajectory" className="btn-premium" style={{ padding: '0.9rem 1.6rem', borderRadius: '9999px', background: 'var(--color-surface)' }}>
            <span className="btn-icon">
              <FiBriefcase size={15} /> {t("home.view-trajectory")}
            </span>
          </a>
        </motion.div>

        {/* Floating Parallax Skills (Editorial Capsules) */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: '4.5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <motion.div 
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="card-premium"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 1.15rem 0.6rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            <span className="ecosystem-icon" style={{ width: '34px', height: '34px' }}>
              <FiTerminal size={15} />
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
              {t("home.tag_frontend", "Frontend")}
            </span>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -9, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="card-premium"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 1.15rem 0.6rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            <span className="ecosystem-icon" style={{ width: '34px', height: '34px' }}>
              <FiServer size={15} />
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
              {t("home.tag_backend", "Backend")}
            </span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -7, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="card-premium"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 1.15rem 0.6rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            <span className="ecosystem-icon" style={{ width: '34px', height: '34px' }}>
              <FiLayout size={15} />
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
              {t("home.tag_uiux", "UI/UX Design")}
            </span>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default withProviders(HomePage);
