import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { FaceSecureLogo } from '../dashboard/FaceSecureLogo';
import { VerifiedShieldLogo } from '../dashboard/VerifiedShieldLogo';

interface LogoTransitionOverlayProps {
    onComplete: () => void;
}

export function LogoTransitionOverlay({ onComplete }: LogoTransitionOverlayProps) {
    const [phase, setPhase] = useState<'scanning' | 'morphing' | 'completed'>('scanning');
    const [layout, setLayout] = useState({ left: 0, top: 0 });

    useEffect(() => {
        const updateLayout = () => {
            const containerWidth = Math.min(window.innerWidth, 1280);
            const containerX = (window.innerWidth - containerWidth) / 2;

            // Dashboard Header Layout:
            // max-w-7xl (1280px) centered
            // py-12 (48px top padding)
            // px-6 (24px left padding)
            setLayout({
                left: containerX + 24,
                top: 48
            });
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);

        const morphTimer = setTimeout(() => setPhase('morphing'), 2000);
        const completeTimer = setTimeout(() => {
            setPhase('completed');
            setTimeout(onComplete, 1200);
        }, 3500);

        return () => {
            window.removeEventListener('resize', updateLayout);
            clearTimeout(morphTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#0B1C2D] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Background Data Beams */}
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence>
                    {phase === 'morphing' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-px bg-gradient-to-t from-transparent via-[#2ECFFF] to-transparent h-screen"
                                    style={{ left: `${(i + 1) * 8}%` }}
                                    animate={{ y: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "linear" }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                    {phase === 'scanning' ? (
                        <motion.div
                            key="scanning-logo"
                            className="absolute inset-0 flex flex-col items-center justify-center p-6"
                            exit={{ scale: 1.2, filter: 'blur(20px) brightness(2)', opacity: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <FaceSecureLogo />
                            <motion.div
                                className="mt-12 flex flex-col items-center gap-2"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <p className="text-[#2ECFFF] font-mono tracking-[0.3em] text-sm uppercase">Authenticating Identity...</p>
                                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#2ECFFF]"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, ease: "linear" }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="verified-logo"
                            className="absolute"
                            initial={{
                                left: '50%',
                                top: '50%',
                                x: '-50%',
                                y: '-50%',
                                scale: 0.5,
                                opacity: 0
                            }}
                            animate={{
                                left: phase === 'completed' ? `${layout.left}px` : '50%',
                                top: phase === 'completed' ? `${layout.top}px` : '50%',
                                x: phase === 'completed' ? '0%' : '-50%',
                                y: phase === 'completed' ? '0%' : '-50%',
                                scale: phase === 'completed' ? 1 : [0.5, 1.1, 1],
                                opacity: 1
                            }}
                            transition={{
                                left: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] },
                                top: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] },
                                x: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] },
                                y: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] },
                                scale: { duration: 0.8 }
                            }}
                        >
                            <VerifiedShieldLogo />

                            {phase === 'morphing' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full mt-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                                >
                                    <h3 className="text-2xl font-bold text-white mb-2">Access Granted</h3>
                                    <p className="text-[#2ECFFF] font-mono text-xs uppercase tracking-widest">Compiling Secure Session...</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Cinematic Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </motion.div>
    );
}
