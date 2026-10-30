import withProviders from '../components/withProviders.jsx';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BriefcaseBusiness, Download, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { openCvModal } from '../utils/cvModal.js';
import { api } from '../services/api.js';

const TrajectoryPage = () => {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const result = await api.experiences.getAll('published');
        const items = result?.success && Array.isArray(result.data)
          ? result.data
          : [];

        setExperiences(items.sort((a, b) => {
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
          return new Date(b.created_at) - new Date(a.created_at);
        }));
      } catch (error) {
        if (import.meta.env.DEV) console.error('Unable to load trajectory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, []);

  return (
    <section className="projects-section" style={{ minHeight: '100svh' }}>
      <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="projects-header"
          style={{ paddingTop: 0, marginBottom: '2.25rem' }}
        >
          <span className="section-label">
            {t('trajectory.eyebrow')}
          </span>
          <h1 className="projects-title">{t('trajectory.title')}</h1>
          <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'clamp(1rem, 1.45vw, 1.2rem)', lineHeight: 1.7 }}>
            {t('trajectory.description')}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem', marginBottom: '3.5rem' }}
        >
          <button
            onClick={() => openCvModal()}
            className="btn-premium"
            style={{ background: 'var(--color-text)', color: 'var(--color-bg)', borderColor: 'var(--color-text)', padding: '0.8rem 1.65rem' }}
          >
            <Download size={15} /> {t('trajectory.download-cv')}
          </button>
          <a href="/contact" className="btn-premium" style={{ background: 'var(--color-surface)', padding: '0.8rem 1.65rem' }}>
            {t('trajectory.contact')} <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="card-premium skeleton-loader" style={{ height: '280px', padding: '2.5rem', opacity: 1 - (idx * 0.2) }}>
                   <div className="skeleton-pulse" style={{ height: '32px', width: '50%', marginBottom: '1rem', borderRadius: '4px', background: 'var(--color-border)' }}></div>
                   <div className="skeleton-pulse" style={{ height: '20px', width: '30%', marginBottom: '2rem', borderRadius: '4px', background: 'var(--color-border)' }}></div>
                   <div className="skeleton-pulse" style={{ height: '16px', width: '100%', marginBottom: '0.6rem', borderRadius: '4px', background: 'var(--color-border)' }}></div>
                   <div className="skeleton-pulse" style={{ height: '16px', width: '90%', marginBottom: '0.6rem', borderRadius: '4px', background: 'var(--color-border)' }}></div>
                   <div className="skeleton-pulse" style={{ height: '16px', width: '95%', marginBottom: '2rem', borderRadius: '4px', background: 'var(--color-border)' }}></div>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <div className="skeleton-pulse" style={{ height: '28px', width: '90px', borderRadius: '999px', background: 'var(--color-border)' }}></div>
                     <div className="skeleton-pulse" style={{ height: '28px', width: '120px', borderRadius: '999px', background: 'var(--color-border)' }}></div>
                   </div>
                </div>
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="card-premium" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <BriefcaseBusiness size={36} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted)' }} />
              <p className="text-muted">{t('trajectory.empty')}</p>
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.35rem' }}>
              {experiences.map((experience, index) => (
                <motion.li
                  key={experience.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="card-premium"
                  style={{ padding: 'clamp(1.5rem, 4vw, 2.25rem)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem' }}
                >
                  <div aria-hidden="true" className="ecosystem-icon">
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '0.55rem' }}>
                      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.025em', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', lineHeight: 1.2, color: 'var(--color-text)' }}>
                        {experience.title}
                      </h2>
                      {experience.period && (
                        <span className="ecosystem-kicker" style={{ padding: '0.28rem 0.7rem', borderRadius: '999px', background: 'var(--color-faint)', border: '1px solid var(--color-border)' }}>
                          {experience.period}
                        </span>
                      )}
                    </div>
                    {(experience.company || experience.location) && (
                      <p className="text-muted" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}>
                        {experience.company && <strong style={{ color: 'var(--color-text)' }}>{experience.company}</strong>}
                        {experience.location && <><span aria-hidden="true">·</span><MapPin size={13} /> {experience.location}</>}
                      </p>
                    )}
                    {experience.description && <p className="text-muted" style={{ marginBottom: experience.technologies?.length ? '1.5rem' : 0, lineHeight: 1.7 }}>{experience.description}</p>}
                    {Array.isArray(experience.technologies) && experience.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {experience.technologies.map((technology) => (
                          <span key={technology} className="project-tag">{technology}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};

export default withProviders(TrajectoryPage);
