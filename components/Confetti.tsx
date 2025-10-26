
import React, { useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
}

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

export const Confetti: React.FC<{ count?: number }> = ({ count = 150 }) => {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 4}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
        position: 'absolute',
        top: '-20px',
        width: `${Math.random() * 8 + 6}px`,
        height: `${Math.random() * 8 + 6}px`,
      };
      return { id: index, style };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map(p => (
        <div key={p.id} style={p.style} />
      ))}
    </div>
  );
};
