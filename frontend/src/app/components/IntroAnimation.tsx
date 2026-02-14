import { motion, useAnimation } from 'motion/react';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const controls = useAnimation();
  const [showGlow, setShowGlow] = useState(true);

  useEffect(() => {
    const sequence = async () => {
      // Initial centered state with breathing effect
      await controls.start({
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1] // Elastic easing
        }
      });

      // Hold for a moment
      await new Promise(resolve => setTimeout(resolve, 800));

      // Scale down and move to top-left
      setShowGlow(false);
      await controls.start({
        scale: 0.15,
        x: 'calc(-50vw + 48px)', // Move to left side
        y: 'calc(-50vh + 32px)', // Move to top
        transition: {
          duration: 1.2,
          ease: [0.45, 0, 0.15, 1] // Smooth cubic bezier
        }
      });

      // Fade out the intro overlay
      await new Promise(resolve => setTimeout(resolve, 300));
      onComplete();
    };

    sequence();
  }, [controls, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#0B1C2D] via-[#050E18] to-[#0B1C2D]"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {showGlow && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2ECFFF] rounded-full mix-blend-screen filter blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#2ECFFF] rounded-full mix-blend-screen filter blur-3xl opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={controls}
        className="relative"
      >
        {/* Glowing ring effect */}
        {showGlow && (
          <motion.div
            className="absolute inset-0 -m-12"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#1A8FCC] via-[#2ECFFF] to-[#5ED8F5] blur-2xl opacity-50" />
          </motion.div>
        )}

        {/* Rotating ring */}
        {showGlow && (
          <motion.div
            className="absolute inset-0 -m-16"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="0.5"
                strokeDasharray="10 5"
                opacity="0.5"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ECFFF" />
                  <stop offset="50%" stopColor="#2ECFFF" />
                  <stop offset="100%" stopColor="#5ED8F5" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}

        {/* Main logo image */}
        <motion.div
          className="w-64 h-64 flex items-center justify-center drop-shadow-2xl"
          animate={showGlow ? {
            filter: [
              'drop-shadow(0 0 20px rgba(31, 182, 201, 0.5))',
              'drop-shadow(0 0 40px rgba(61, 213, 231, 0.8))',
              'drop-shadow(0 0 20px rgba(31, 182, 201, 0.5))'
            ]
          } : {}}
          transition={{
            duration: 2,
            repeat: showGlow ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <Shield className="w-full h-full text-[#2ECFFF]" />
        </motion.div>

        {/* Orbiting particles */}
        {showGlow && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#5ED8F5] rounded-full shadow-[0_0_10px_rgba(111,234,255,0.8)]"
                style={{
                  originX: 0.5,
                  originY: 0.5,
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((i / 8) * Math.PI * 2) * 150,
                  y: Math.sin((i / 8) * Math.PI * 2) * 150,
                }}
                transition={{
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.1
                  },
                  x: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.1
                  },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.1
                  }
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Loading text */}
      {showGlow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-1/4 text-center"
        >
          <motion.div
            className="text-2xl text-white mb-4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            FaceSecure
          </motion.div>
          <div className="flex gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#2ECFFF] rounded-full shadow-[0_0_8px_rgba(61,213,231,0.6)]"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
