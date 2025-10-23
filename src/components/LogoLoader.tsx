import React from 'react';
import { useImageLoader } from './ImageLoader';

interface LogoLoaderProps {
  className?: string;
  alt?: string;
  logoPath: string;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  className = "",
  alt,
  logoPath,
}) => {
  const logoAlt = alt || logoPath.split('/').pop()?.split('.')[0] || "Logo";
  
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