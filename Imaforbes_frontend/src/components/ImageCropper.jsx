// src/components/ImageCropper.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Move, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ImageCropper = ({ imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // Zoom level (1 = 100%, 2 = 200%, etc.)
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageSrc(e.target.result);
          setImageSize({ width: img.width, height: img.height });
          setZoom(1); // Reset zoom when new image loads
          
          // Calculate initial displayed size to fit container while maintaining aspect ratio
          const updateDisplaySize = () => {
            if (!containerRef.current) {
              setTimeout(updateDisplaySize, 100);
              return;
            }
            
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const imageAspectRatio = img.width / img.height;
            const containerAspectRatio = containerWidth / containerHeight;
            
            let displayedWidth, displayedHeight;
            
            if (imageAspectRatio > containerAspectRatio) {
              // Image is wider (horizontal) - fit to container width
              displayedWidth = containerWidth;
              displayedHeight = displayedWidth / imageAspectRatio;
            } else {
              // Image is taller (vertical) - fit to container height
              displayedHeight = containerHeight;
              displayedWidth = displayedHeight * imageAspectRatio;
            }
            
            setDisplayedSize({ width: displayedWidth, height: displayedHeight });
            setContainerSize({ width: containerWidth, height: containerHeight });
            setCrop({ x: 0, y: 0 });
          };
          
          // Wait for container to be ready
          setTimeout(updateDisplaySize, 100);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // Update container size and recalculate displayed size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && imageSize.width && imageSize.height) {
        const rect = containerRef.current.getBoundingClientRect();
        const newContainerSize = { width: rect.width, height: rect.height };
        setContainerSize(newContainerSize);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [imageSize]);

  // Calculate actual displayed size with zoom applied
  const zoomedDisplayedSize = {
    width: displayedSize.width * zoom,
    height: displayedSize.height * zoom
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    // Store the initial mouse position and current crop position
    setDragStart({ 
      x: e.clientX - crop.x, 
      y: e.clientY - crop.y 
    });
    
    setIsDragging(true);
  }, [crop]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    // Calculate new position based on mouse movement
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate bounds: image can move within limits so crop area is always filled
    // With zoom, the image can be larger than the container, allowing free movement
    const excessWidth = zoomedDisplayedSize.width - containerSize.width;
    const excessHeight = zoomedDisplayedSize.height - containerSize.height;
    
    // Maximum movement allowed (half of the excess, or 0 if image fits or is smaller)
    const maxX = excessWidth > 0 ? excessWidth / 2 : 0;
    const maxY = excessHeight > 0 ? excessHeight / 2 : 0;
    
    // Minimum movement (negative of max) - allows movement in opposite direction
    const minX = excessWidth > 0 ? -excessWidth / 2 : 0;
    const minY = excessHeight > 0 ? -excessHeight / 2 : 0;
    
    // Clamp the position within bounds
    const clampedX = Math.max(minX, Math.min(maxX, newX));
    const clampedY = Math.max(minY, Math.min(maxY, newY));
    
    setCrop({
      x: clampedX,
      y: clampedY
    });
  }, [isDragging, dragStart, zoomedDisplayedSize, containerSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom + delta));
    setZoom(newZoom);
  }, [zoom]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(5, prev + 0.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!imageSrc || !imageSize.width || !imageSize.height || !zoomedDisplayedSize.width || !zoomedDisplayedSize.height) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate output size: Use high resolution while maintaining square aspect ratio
    const maxOutputSize = 2048;
    const containerOutputSize = Math.min(containerSize.width, containerSize.height);
    
    // Calculate the scale factor from zoomed displayed size to original size
    const scaleToOriginal = imageSize.width / displayedSize.width;
    
    // Calculate the size of the visible crop area in original image coordinates
    const visibleAreaInOriginal = containerOutputSize * scaleToOriginal / zoom;
    
    // Determine output size
    const minOriginalDimension = Math.min(imageSize.width, imageSize.height);
    const outputSize = Math.min(
      Math.max(visibleAreaInOriginal, containerOutputSize),
      maxOutputSize,
      minOriginalDimension
    );
    
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    // Calculate what part of the displayed image is visible in the crop area
    const displayedImageCenterX = zoomedDisplayedSize.width / 2;
    const displayedImageCenterY = zoomedDisplayedSize.height / 2;
    
    // The container center in displayed image coordinate space
    const containerCenterInDisplayedX = displayedImageCenterX - crop.x;
    const containerCenterInDisplayedY = displayedImageCenterY - crop.y;
    
    // Convert container center to original image coordinates
    const sourceCenterX = (containerCenterInDisplayedX / zoom) * scaleToOriginal;
    const sourceCenterY = (containerCenterInDisplayedY / zoom) * scaleToOriginal;
    
    // Calculate source rectangle size in original coordinates
    const sourceWidth = outputSize;
    const sourceHeight = outputSize;
    
    // Calculate source rectangle top-left corner
    const sourceX = sourceCenterX - sourceWidth / 2;
    const sourceY = sourceCenterY - sourceHeight / 2;
    
    // Clamp to image bounds
    const clampedSourceX = Math.max(0, Math.min(imageSize.width - sourceWidth, sourceX));
    const clampedSourceY = Math.max(0, Math.min(imageSize.height - sourceHeight, sourceY));
    const clampedSourceWidth = Math.min(sourceWidth, imageSize.width - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceHeight, imageSize.height - clampedSourceY);
    
    // Draw cropped image
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the cropped portion
        if (clampedSourceWidth === sourceWidth && clampedSourceHeight === sourceHeight) {
          ctx.drawImage(
            img,
            clampedSourceX,
            clampedSourceY,
            clampedSourceWidth,
            clampedSourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          const scaleX = canvas.width / clampedSourceWidth;
          const scaleY = canvas.height / clampedSourceHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = clampedSourceWidth * scale;
          const scaledHeight = clampedSourceHeight * scale;
          const offsetX = (canvas.width - scaledWidth) / 2;
          const offsetY = (canvas.height - scaledHeight) / 2;
          
          ctx.drawImage(
            img,
            clampedSourceX,
            clampedSourceY,
            clampedSourceWidth,
            clampedSourceHeight,
            offsetX,
            offsetY,
            scaledWidth,
            scaledHeight
          );
        }
        
        const mimeType = imageFile.type || 'image/jpeg';
        const quality = mimeType === 'image/png' ? undefined : 0.98;
        
        if (mimeType === 'image/png') {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        } else {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', quality);
        }
      };
      img.src = imageSrc;
    });
  }, [imageSrc, imageSize, displayedSize, zoomedDisplayedSize, crop, containerSize, zoom, imageFile]);

  const handleCrop = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob) {
      const originalType = imageFile.type || 'image/jpeg';
      const originalName = imageFile.name;
      const extension = originalName.split('.').pop() || 'jpg';
      const baseName = originalName.replace(/\.[^/.]+$/, '');
      
      const croppedFile = new File([croppedBlob], `${baseName}_cropped.${extension}`, {
        type: originalType,
        lastModified: Date.now()
      });
      onCropComplete(croppedFile);
    }
  };

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-light text-gray-900 dark:text-white">Recortar Imagen</h3>
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            ref={containerRef}
            className="relative mx-auto bg-gray-100 dark:bg-[#1a1a1a] rounded-lg overflow-hidden"
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              aspectRatio: '1', 
              minHeight: '400px',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="absolute top-1/2 left-1/2 select-none"
              style={{
                width: `${zoomedDisplayedSize.width}px`,
                height: `${zoomedDisplayedSize.height}px`,
                transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
            
            {/* Crop overlay */}
            <div className="absolute inset-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-light">Zoom:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Alejar"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] rounded-lg transition-colors text-xs font-light"
                title="Resetear"
              >
                Reset
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="p-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Acercar"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 font-light">
              <Move size={14} />
              Arrastra la imagen para posicionarla
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-light">
              Usa la rueda del mouse o los botones para hacer zoom
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] rounded-xl transition-colors font-light"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 font-light"
          >
            <Check size={18} />
            Aplicar Recorte
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCropper;
