// src/components/ProtectedImage.jsx
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ProtectedImage = ({ src, alt, className, ...props }) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    const container = containerRef.current;

    if (!img || !container) return;

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent text/image selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts (Ctrl+S, Ctrl+P, etc.)
    const handleKeyDown = (e) => {
      // Block common download shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U')
      ) {
        if (container.contains(e.target) || img.contains(e.target)) {
          e.preventDefault();
          return false;
        }
      }
    };

    // Disable image dragging
    img.draggable = false;
    img.style.userSelect = 'none';
    img.style.webkitUserSelect = 'none';
    img.style.MozUserSelect = 'none';
    img.style.msUserSelect = 'none';
    img.style.webkitUserDrag = 'none';
    img.style.khtmlUserDrag = 'none';
    
    // Add event listeners
    img.addEventListener('contextmenu', handleContextMenu);
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('selectstart', handleSelectStart);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      img.removeEventListener('contextmenu', handleContextMenu);
      img.removeEventListener('dragstart', handleDragStart);
      img.removeEventListener('selectstart', handleSelectStart);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [src]);

  return (
    <motion.div
      ref={containerRef}
      className={`protected-image-container relative ${className || ''}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto',
        position: 'relative',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Transparent overlay to prevent direct image access */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'transparent',
          pointerEvents: 'auto',
          cursor: 'default',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      
      {/* Watermark overlay (subtle pattern) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(0,0,0,0.02) 50px, rgba(0,0,0,0.02) 100px)',
          opacity: 0.3,
        }}
      />
      
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`protected-image w-full h-full object-cover ${(className && className.includes && className.includes('rounded')) ? (className.match(/rounded-\w+/)?.[0] || '') : ''}`}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserDrag: 'none',
          userDrag: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
        }}
        loading="lazy"
        decoding="async"
        {...props}
      />
      
      {/* CSS-based watermark (visible on inspect) */}
      <div
        className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.05)',
          transform: 'rotate(-45deg)',
          whiteSpace: 'nowrap',
        }}
        aria-hidden="true"
      >
        IMAFORBES ©
      </div>
    </motion.div>
  );
};

export default ProtectedImage;

