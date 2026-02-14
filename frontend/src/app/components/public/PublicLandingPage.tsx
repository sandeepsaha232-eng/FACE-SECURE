import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, CheckCircle2, User, ArrowRight, Loader2 } from 'lucide-react';
import { CameraStream } from '../shared/CameraStream';
import { FaceSecureLogo } from '../dashboard/FaceSecureLogo';
import { statsService } from '../../services/statsService';
import { toast, Toaster } from 'sonner';

interface PublicLandingPageProps {
    onVerifySuccess?: () => void;
}

export function PublicLandingPage({ onVerifySuccess }: PublicLandingPageProps) {
    const [name, setName] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [lastPhoto, setLastPhoto] = useState('');
    const [lastScore, setLastScore] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLivenessResult = (live: boolean, score: number, photo: string) => {
        setIsLive(live);
        if (live) {
            setLastPhoto(photo);
            setLastScore(score);
        }
    };

    const handleVerify = async () => {
        if (!name || !lastPhoto) return;
        setIsSubmitting(true);
        try {
            await statsService.submitVerification(name, lastPhoto, lastScore);
            setIsVerified(true);
            toast.success('Verification Completed Successfully!', {
                description: 'Your identity has been confirmed and recorded.',
                duration: 5000,
            });
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen bg-[#0B1C2D] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/5 border border-emerald-500/30 p-12 rounded-3xl text-center backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                >
                    <div className="w-24 h-24 bg-[#2DFF9A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <CheckCircle2 className="w-12 h-12 text-[#0B1C2D]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Verified successfully</h2>
                    <p className="text-[#2DFF9A] text-lg mb-8">You are a live human</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 rounded-xl bg-[#2DFF9A] hover:bg-[#2DFF9A] text-[#0B1C2D] font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Return to Homepage
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B1C2D] via-[#050E18] to-[#0B1C2D] text-white overflow-hidden selection:bg-[#2ECFFF] selection:text-[#0B1C2D]">
            {/* Header */}
            <header className="relative border-b border-[#2ECFFF]/20 bg-[#0B1C2D]/80 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <FaceSecureLogo />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative">
                {/* Background Decorations */}
                <div className="absolute top-1/4 -left-24 w-96 h-96 bg-[#2ECFFF]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-[#5ED8F5]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left Side: Camera Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECFFF] to-[#050E18] flex items-center justify-center shadow-[0_0_15px_rgba(31,182,201,0.4)]">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                Identity Verification
                            </h2>
                            <p className="text-[#8FAEC6] text-lg">
                                Please enter your name and position your face within the frame.
                            </p>
                        </div>

                        {/* Name Input Field */}
                        <div className="mb-6">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FAEC6] group-focus-within:text-[#2ECFFF] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#6B8BA4] focus:outline-none focus:border-[#2ECFFF]/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <Toaster position="top-center" richColors />
                        <CameraStream onLivenessResult={handleLivenessResult} />

                        {/* Submit Button - Only visible when green (isLive) */}
                        <AnimatePresence>
                            {isLive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="mt-6"
                                >
                                    <button
                                        onClick={handleVerify}
                                        disabled={isSubmitting || !name.trim()}
                                        className="w-full bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D] font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(61,213,231,0.3)] transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                Verify
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    {!name.trim() && (
                                        <p className="text-amber-400 text-xs text-center mt-2 animate-pulse font-mono uppercase tracking-widest">
                                            Please enter your name to verify
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050E18] bg-[#2ECFFF]/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-[#2ECFFF]" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-[#6B8BA4] font-medium">
                                Trusted by <span className="text-[#2ECFFF]">enterprise-grade</span> security protocols.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Greeting & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2ECFFF]/10 border border-[#2ECFFF]/20 text-[#2ECFFF] text-sm font-semibold tracking-wide"
                            >
                                <Lock className="w-4 h-4" />
                                End-to-End Encrypted Session
                            </motion.div>

                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Welcome to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A8FCC] via-[#2ECFFF] to-[#5ED8F5]">
                                    Secure Connect
                                </span>
                            </h1>

                            <p className="text-xl text-[#8FAEC6] leading-relaxed max-w-xl">
                                We've partnered with <span className="text-white font-medium">FaceSecure</span> to provide you with the most advanced biometric protection available. Your data is encrypted locally before transmission.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: 'Privacy First', desc: 'No biometric data is ever stored on our servers.' },
                                { title: 'Instant Verification', desc: 'Real-time analysis powered by advanced AI.' },
                                { title: 'Encrypted Link', desc: 'This session is unique and time-limited.' },
                                { title: 'Global Trust', desc: 'Compliant with peak security standards.' }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#2ECFFF]/30 transition-colors group"
                                >
                                    <h4 className="font-bold text-[#2ECFFF] mb-2 group-hover:text-[#5ED8F5] transition-colors">{feature.title}</h4>
                                    <p className="text-sm text-[#8FAEC6]">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center gap-6 border-t border-white/10 text-center sm:text-left">
                            <div className="text-sm">
                                <p className="text-[#6B8BA4] mb-1 font-mono uppercase tracking-widest text-xs">Security Provider</p>
                                <p className="text-white font-bold text-lg">FaceSecure Pro</p>
                            </div>
                            <div className="hidden sm:block w-px h-12 bg-white/10" />
                            <div className="text-sm">
                                <p className="text-[#6B8BA4] mb-1 font-mono uppercase tracking-widest text-xs">Collaboration Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#2DFF9A] animate-pulse" />
                                    <p className="text-white font-bold text-lg">Verified Secure Portal</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer Background Effect */}
            <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B1C2D] to-transparent pointer-events-none" />
        </div>
    );
}
