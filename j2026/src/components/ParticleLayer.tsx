import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface ParticleLayerProps {
  accent: string;
}

interface Particle {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export function ParticleLayer({ accent }: ParticleLayerProps) {
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        top: 8 + ((index * 11) % 82),
        left: 6 + ((index * 17) % 84),
        size: 2 + (index % 4),
        duration: 16 + (index % 5) * 3,
        delay: index * 0.4,
      })),
    [],
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      setPointerOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      animate={{ x: pointerOffset.x, y: pointerOffset.y }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: `${accent}90`,
            boxShadow: `0 0 18px ${accent}50`,
          }}
          animate={{
            y: [0, -22, 14, 0],
            x: [0, 8, -6, 0],
            opacity: [0.15, 0.5, 0.2, 0.15],
            scale: [1, 1.35, 0.92, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
