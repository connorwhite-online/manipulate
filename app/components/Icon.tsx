import React from 'react';

interface IconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export default function Icon({ name, size = 24, color = 'currentColor', className, onClick }: IconProps) {
  const iconStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const svgStyle = {
    width: '100%',
    height: '100%',
    fill: color === 'currentColor' ? 'currentColor' : color,
    stroke: color === 'currentColor' ? 'currentColor' : color,
  };

  return (
    <div 
      className={className}
      onClick={onClick}
      style={{ ...iconStyle, color }}
    >
      <img
        src={`/icons/${name}.svg`}
        alt={name}
        style={{
          width: '100%',
          height: '100%',
          filter: color === 'white' ? 'brightness(0) invert(1)' : 
                  color === 'black' ? 'brightness(0)' : 
                  'brightness(0) invert(1)', // Default to white for visibility
        }}
      />
    </div>
  );
} 