import { motion } from 'motion/react';
import { Shield, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerifiedShieldLogo() {
    return (
        <Link to="/" className="flex items-center gap-6 group">
            <div className="relative">
                {/* Harmonic Background Rings */}
                {[1, 1.2, 1.4].map((scale, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-2xl border border-[#2ECFFF]/10"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                            scale: scale,
                            opacity: [0, 0.2, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* Main Glass Shield */}
                <motion.div
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ECFFF] to-[#050E18] flex items-center justify-center shadow-[0_0_30px_rgba(31,182,201,0.3)] border border-[#2ECFFF]/30 overflow-hidden"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                    {/* Shimmer Effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    <Shield className="w-8 h-8 text-white relative z-10" />

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                        className="absolute bottom-3 right-3 w-5 h-5 bg-[#2ECFFF] rounded-full flex items-center justify-center shadow-lg shadow-[#2ECFFF]/40 z-20"
                    >
                        <Check className="w-3 h-3 text-[#0B1C2D] stroke-[4]" />
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Face<span className="text-[#2ECFFF]">Secure</span>
                    </h1>
                    <div className="px-2 py-0.5 rounded bg-[#2DFF9A]/10 border border-emerald-500/20">
                        <span className="text-[10px] font-bold text-[#2DFF9A] uppercase tracking-widest">Verified</span>
                    </div>
                </div>
                <p className="text-[10px] text-[#8FAEC6] font-mono uppercase tracking-[0.2em] mt-1">
                    Secure Biometric Access
                </p>
            </div>
        </Link>
    );
}
