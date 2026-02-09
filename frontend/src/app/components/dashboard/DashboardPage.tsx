import { useState } from 'react';
import { PricingSection } from './PricingSection';
import { FaceSecureLogo } from './FaceSecureLogo';
import { IntegrationSelection } from './IntegrationSelection';
import { Toaster } from '../ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

export function DashboardPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071C2F] via-[#0A2A44] to-[#071C2F] relative overflow-hidden">
            <Toaster position="top-right" />

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3DD5E7] rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Gradient orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#1FB6C9]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#6FEAFF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <header className="relative border-b border-[#1FB6C9]/30 bg-[#071C2F]/80 backdrop-blur-md z-10">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <FaceSecureLogo />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-6 py-16 z-10">
                <AnimatePresence mode="wait">
                    {!selectedPlan ? (
                        <motion.div
                            key="pricing-view"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Hero Section */}
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                            >
                                <motion.div
                                    className="inline-block mb-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FB6C9]/10 border border-[#1FB6C9]/30">
                                        <div className="w-2 h-2 bg-[#6FEAFF] rounded-full animate-pulse" />
                                        <span className="text-[#3DD5E7] text-sm">Trusted by 10,000+ organizations worldwide</span>
                                    </div>
                                </motion.div>

                                <motion.h2
                                    className="text-5xl md:text-6xl text-white mb-6 leading-tight font-bold"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                >
                                    Secure Your Platform with
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1FB6C9] via-[#3DD5E7] to-[#6FEAFF]">
                                        Advanced Face Recognition
                                    </span>
                                </motion.h2>

                                <motion.p
                                    className="text-gray-400 text-xl max-w-3xl mx-auto"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                >
                                    Choose your plan and start protecting your users with cutting-edge biometric verification technology
                                </motion.p>
                            </motion.div>

                            {/* Pricing Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                            >
                                <PricingSection onSelectPlan={(plan) => setSelectedPlan(plan)} />
                            </motion.section>

                            {/* Trust indicators */}
                            <motion.div
                                className="mt-20 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                            >
                                <p className="text-gray-500 text-sm mb-6">Trusted by industry leaders</p>
                                <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
                                    {['TechCorp', 'SecureBank', 'HealthPlus', 'FinanceHub', 'DataVault'].map((company) => (
                                        <div
                                            key={company}
                                            className="text-[#3DD5E7] text-lg font-semibold tracking-wider"
                                        >
                                            {company}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="integration-view"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="py-8"
                        >
                            <IntegrationSelection
                                planName={selectedPlan}
                                onBack={() => setSelectedPlan(null)}
                                onSelectMethod={(method) => {
                                    console.log('Selected method:', method);
                                    // Further logic for API/Link generation can be added here
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative border-t border-[#1FB6C9]/30 bg-[#071C2F]/80 backdrop-blur-md mt-24 z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2026 Face Secure. Enterprise-grade biometric security.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-[#3DD5E7] hover:text-[#6FEAFF] transition-colors">Privacy Policy</a>
                            <a href="#" className="text-[#3DD5E7] hover:text-[#6FEAFF] transition-colors">Terms of Service</a>
                            <a href="#" className="text-[#3DD5E7] hover:text-[#6FEAFF] transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
