import React, { useState, useEffect, useRef } from 'react';

interface ImageLoaderProps {
  basePath: string;
  alt: string;
  className?: string;
  priorityExtensions: string[];
  onLoad?: () => void;
  onError?: () => void;
  videoControls?: boolean;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  isPlaying?: boolean;
}

export const ImageLoader: React.FC<ImageLoaderProps> = ({
  basePath,
  alt,
  className = "",
  priorityExtensions,
  onLoad,
  onError,
  videoControls = false,
  onVideoRef,
  isPlaying = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsVideo(false);

      for (const extension of priorityExtensions) {
        const mediaSrc = `${basePath}.${extension}`;
        
        try {
          if (extension === 'mp4') {
            // Para videos, necesitamos verificar si se puede cargar
            await new Promise<void>((resolve, reject) => {
              const video = document.createElement('video');
              video.onloadeddata = () => {
                setCurrentSrc(mediaSrc);
                setIsVideo(true);
                setIsLoading(false);
                resolve();
              };
              video.onerror = () => {
                reject(new Error(`Failed to load video ${mediaSrc}`));
              };
              video.src = mediaSrc;
            });
          } else {
            // Para imágenes, usar el método tradicional
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                setCurrentSrc(mediaSrc);
                setIsVideo(false);
                setIsLoading(false);
                resolve();
              };
              img.onerror = () => {
                reject(new Error(`Failed to load image ${mediaSrc}`));
              };
              img.src = mediaSrc;
            });
          }
          break; // Si se cargó correctamente, salir del bucle
        } catch (error) {
          console.debug(`Failed to load ${mediaSrc}, trying next...`);
          
          // Si es el último intento y todos fallaron
          if (extension === priorityExtensions[priorityExtensions.length - 1]) {
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        }
      }
    };

    loadMedia();
  }, [basePath, JSON.stringify(priorityExtensions)]);

  useEffect(() => {
    if (videoRef.current && isVideo) {
      onVideoRef?.(videoRef.current);
    }
  }, [videoRef.current, isVideo, onVideoRef]);

  // Manejar la reproducción/pausa del video
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isPlaying) {
        // Intentar reproducir el video cuando la canción está en reproducción
        const playVideo = () => {
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(error => {
              console.warn('Video play failed:', error);
            });
          }
        };

        // Si el video ya tiene suficientes datos cargados, reproducir inmediatamente
        if (videoRef.current.readyState >= 2) {
          playVideo();
        } else {
          // Si no, esperar a que se cargue suficiente datos
          videoRef.current.addEventListener('canplay', playVideo, { once: true });
        }
      } else {
        // Pausar el video cuando la canción no se está reproduciendo
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }
  }, [isPlaying, isVideo]);

  if (isLoading) {
    return (
      <div className={`bg-gray-800 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-gray-800 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-600 text-center">
            <div className="text-2xl mb-2">🎵</div>
            <div className="text-sm">Media not found</div>
          </div>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={currentSrc}
        className={className}
        muted
        loop
        playsInline
        controls={videoControls}
        onLoadedData={onLoad}
        onError={() => {
          console.error('Video failed to load:', currentSrc);
          onError?.();
        }}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => {
        console.error('Image failed to load:', currentSrc);
        onError?.();
      }}
    />
  );
};

// Hook personalizado para manejar la lógica de carga de imágenes
export const useImageLoader = (basePath: string, priorityExtensions: string[]) => {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      for (const extension of priorityExtensions) {
        const imageSrc = `${basePath}.${extension}`;
        
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              setSrc(imageSrc);
              setIsLoading(false);
              resolve();
            };
            img.onerror = () => {
              reject(new Error(`Failed to load ${imageSrc}`));
            };
            img.src = imageSrc;
          });
          break; // Si la imagen se cargó correctamente, salir del bucle
        } catch (error) {
          console.debug(`Failed to load ${imageSrc}, trying next...`);
          
          // Si es el último intento y todos fallaron
          if (extension === priorityExtensions[priorityExtensions.length - 1]) {
            setHasError(true);
            setIsLoading(false);
          }
        }
      }
    };

    loadImage();
  }, [basePath, JSON.stringify(priorityExtensions)]);

  return { src, isLoading, hasError };
};
