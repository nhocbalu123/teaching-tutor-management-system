import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Fireworks.module.css';

interface FireworksProps {
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  gravity: number;
  life: number;
  maxLife: number;
}

const COLORS = [
  '#f97316', // Primary orange
  '#10b981', // Secondary green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange (repeated for more orange particles)
];

const Fireworks: React.FC<FireworksProps> = ({ 
  isVisible, 
  onComplete, 
  duration = 3000 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const createParticles = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    const particleCount = 15 + Math.random() * 10; // 15-25 particles

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Math.random(),
        x: centerX,
        y: centerY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
        velocity: 80 + Math.random() * 40, // Initial velocity
        gravity: 0.8 + Math.random() * 0.4,
        life: 1,
        maxLife: 1.5 + Math.random() * 0.5,
      });
    }

    return newParticles;
  };

  const createFireworkBurst = useCallback(() => {
    // Create multiple bursts at different positions
    const bursts = [
      { x: 20 + Math.random() * 60, y: 20 + Math.random() * 40 },
      { x: 20 + Math.random() * 60, y: 20 + Math.random() * 40 },
      { x: 20 + Math.random() * 60, y: 20 + Math.random() * 40 },
    ];

    let allParticles: Particle[] = [];
    bursts.forEach(burst => {
      const burstParticles = createParticles(burst.x, burst.y);
      allParticles = [...allParticles, ...burstParticles];
    });

    setParticles(allParticles);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIsAnimating(false);
      setParticles([]);
      return;
    }

    setIsAnimating(true);

    // Create initial burst
    setTimeout(() => createFireworkBurst(), 200);
    
    // Create additional bursts
    setTimeout(() => createFireworkBurst(), 800);
    setTimeout(() => createFireworkBurst(), 1400);

    // Complete animation
    const completeTimer = setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [isVisible, duration, onComplete, createFireworkBurst]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className={styles.fireworksContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={styles.particle}
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 6px ${particle.color}`,
              }}
              initial={{
                x: `${particle.x}%`,
                y: `${particle.y}%`,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${particle.x + Math.cos(particle.angle) * particle.velocity}%`,
                y: `${particle.y + Math.sin(particle.angle) * particle.velocity}%`,
                scale: [0, 1, 0.8, 0],
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: particle.maxLife,
                ease: "easeOut",
              }}
            />
          ))}
          
          {/* Sparkle overlay */}
          <motion.div
            className={styles.sparkleOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, repeat: 2 }}
          />
          
          {/* Central burst effect */}
          <motion.div
            className={styles.centralBurst}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 1.2, 
              times: [0, 0.3, 1],
              repeat: 2,
              repeatDelay: 0.6
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Fireworks; 