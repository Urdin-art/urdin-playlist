import React from 'react';
import { useImageLoader } from './ImageLoader';
import { useAppConfig } from '@/hooks/useAppConfig';

interface LogoLoaderProps {
  className?: string;
  alt?: string;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  className = "",
  alt,
}) => {
  const { config } = useAppConfig();
  
  // Usar el logo de la configuración o el logo por defecto
  const logoPath = config?.logo || '/logo';
  const logoAlt = alt || config?.logo?.split('/').pop()?.split('.')[0] || "Logo";
  
  // Eliminar extensión si existe para que useImageLoader pueda añadir la suya
  const removeExtension = (path: string): string => {
    const lastDotIndex = path.lastIndexOf('.');
    return lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
  };
  
  const { src, isLoading, hasError } = useImageLoader(removeExtension(logoPath), ['webp', 'png', 'jpg']);

  if (isLoading) {
    return (
      <div className={`glass-effect animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-dimmed">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`glass-effect ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-dimmed text-center">
            <div className="text-2xl mb-2">🎵</div>
            <div className="text-sm">Logo not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={logoAlt}
      className={className}
    />
  );
};
