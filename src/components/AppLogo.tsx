import React from 'react';

/**
 * Komponen logo "Pelacak Kebiasaan".
 * Merender gambar dari public/icon.svg.
 */
interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 40 }) => (
  <img
    src="/icon.svg"
    alt="Logo Rima Karsa"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
