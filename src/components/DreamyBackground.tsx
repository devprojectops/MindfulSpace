import React from 'react';

const DreamyBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main cosmic gradient background */}
      <div className="absolute inset-0 bg-gradient-cosmic" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-40 right-32 w-64 h-64 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute bottom-32 left-1/3 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />
      
      {/* Twinkling stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-foreground/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
      
      {/* Flowing waves */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
      </div>
      
      {/* Particle trails */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-16 bg-gradient-to-b from-primary/40 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DreamyBackground;