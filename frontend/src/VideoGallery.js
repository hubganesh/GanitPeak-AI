import React from 'react';
import { useTranslation } from './TranslationContext';

const VideoGallery = () => {
  const { t } = useTranslation();

  return (
    <div className="video-gallery">
      <div className="gallery-header">
        <h1>{t('videoGalleryTitle')}</h1>
        <p>{t('videoGallerySubtitle')}</p>
      </div>

      <div className="coming-soon-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div className="coming-soon-icon" style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          🎬
        </div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: 'var(--primary-color, #6366f1)',
          marginBottom: '16px'
        }}>
          Coming Soon
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary, #64748b)',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          Video explanations and tutorials are currently under development. 
          Stay tuned for interactive video content coming to MathVerse!
        </p>
      </div>
    </div>
  );
};

export default VideoGallery;
