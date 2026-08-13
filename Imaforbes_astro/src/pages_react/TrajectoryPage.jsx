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
        const items = result?.success && result.data?.success && Array.isArray(result.data.data)
          ? result.data.data
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
          style={{ paddingTop: 0 }}
        >
          <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {t('trajectory.eyebrow')}
          </p>
          <h1 className="projects-title">{t('trajectory.title')}</h1>
          <p className="text-muted" style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
            {t('trajectory.description')}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}
        >
          <button
            onClick={() => openCvModal()}
            className="btn-premium"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <Download size={16} /> {t('trajectory.download-cv')}
          </button>
          <a href="/contact" className="btn-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {t('trajectory.contact')} <ArrowUpRight size={16} />
          </a>
        </motion.div>

        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {isLoading ? (
            <p className="text-muted" style={{ textAlign: 'center' }}>{t('trajectory.loading')}</p>
          ) : experiences.length === 0 ? (
            <div className="card-premium" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <BriefcaseBusiness size={36} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted-light)' }} />
              <p className="text-muted">{t('trajectory.empty')}</p>
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.25rem' }}>
              {experiences.map((experience, index) => (
                <motion.li
                  key={experience.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="card-premium"
                  style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem' }}
                >
                  <div aria-hidden="true" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--color-bg-light)', color: 'var(--color-text-light)', border: '1px solid var(--color-border-light)' }} className="dark:bg-[#151515] dark:text-white dark:border-gray-700">
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.45rem' }}>
                      <h2 style={{ margin: 0, fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', color: 'var(--color-text-light)' }} className="dark:text-white">{experience.title}</h2>
                      {experience.period && <span className="text-muted" style={{ fontSize: '0.85rem' }}>{experience.period}</span>}
                    </div>
                    {(experience.company || experience.location) && (
                      <p className="text-muted" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem' }}>
                        {experience.company && <strong style={{ color: 'var(--color-text-light)' }} className="dark:text-gray-200">{experience.company}</strong>}
                        {experience.location && <><span aria-hidden="true">·</span><MapPin size={14} /> {experience.location}</>}
                      </p>
                    )}
                    {experience.description && <p className="text-muted" style={{ marginBottom: experience.technologies?.length ? '1rem' : 0, lineHeight: 1.7 }}>{experience.description}</p>}
                    {Array.isArray(experience.technologies) && experience.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {experience.technologies.map((technology) => (
                          <span key={technology} style={{ fontSize: '0.75rem', padding: '0.28rem 0.65rem', border: '1px solid var(--color-border-light)', borderRadius: '999px', color: 'var(--color-text-muted-light)' }} className="dark:border-gray-700">{technology}</span>
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
