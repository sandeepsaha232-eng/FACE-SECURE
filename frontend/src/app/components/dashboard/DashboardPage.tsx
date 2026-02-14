import { useState, useEffect } from 'react';
import { PricingSection } from './PricingSection';
import { VerifiedShieldLogo } from './VerifiedShieldLogo';
import { IntegrationSelection } from './IntegrationSelection';
import { WebsiteLinkReport } from './WebsiteLinkReport';
import { StatsDashboard } from './StatsDashboard';
import { Toaster } from '../ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Activity, Globe, ChevronRight, ShieldAlert } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';
import { apiKeyService } from '../../services/apiKeyService';
import { toast } from 'sonner';

export function DashboardPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(() => {
        return localStorage.getItem('faceSecure_selectedPlan');
    });

    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeIntegration, setActiveIntegration] = useState<'api' | 'link'>('api');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse user from local storage');
            }
        }
    }, []);

    const handleSetPlan = (plan: string | null) => {
        setSelectedPlan(plan);
        if (plan) {
            localStorage.setItem('faceSecure_selectedPlan', plan);
        } else {
            localStorage.removeItem('faceSecure_selectedPlan');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B1C2D] via-[#050E18] to-[#0B1C2D] relative overflow-hidden">
            <Toaster position="top-right" />
            <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#2ECFFF] rounded-full"
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
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#2ECFFF]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#5ED8F5]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <header className="relative border-b border-[#2ECFFF]/30 bg-[#0B1C2D]/80 backdrop-blur-md z-10">
                <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <VerifiedShieldLogo />

                    {user && (
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-3 pl-4 pr-1 py-1 rounded-full border border-[#2ECFFF]/20 bg-[#050E18]/50 hover:bg-[#2ECFFF]/10 hover:border-[#2ECFFF]/40 transition-all group"
                        >
                            <span className="text-sm font-medium text-[#8FAEC6] group-hover:text-white transition-colors hidden sm:block">
                                {user.name}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-[#2ECFFF]/20 flex items-center justify-center overflow-hidden border border-[#2ECFFF]/30 group-hover:border-[#2ECFFF] transition-all">
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-[#2ECFFF]" />
                                )}
                            </div>
                        </button>
                    )}
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
                            className="max-w-4xl mx-auto"
                        >
                            <motion.div
                                className="text-center mb-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-4xl text-white mb-4 font-bold">Secure Your Platform</h2>
                                <p className="text-[#8FAEC6] text-base">Select a security plan to unlock advanced biometric intelligence</p>
                            </motion.div>
                            <PricingSection onSelectPlan={handleSetPlan} />
                        </motion.div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Left Side: Integration Switcher */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:w-64 w-full shrink-0 space-y-4"
                            >
                                <div className="bg-[#050E18] border border-[#2ECFFF]/20 rounded-2xl p-4 shadow-lg">
                                    <div className="text-[10px] text-[#6B8BA4] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-[#2ECFFF]" />
                                        Control Center
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { id: 'api', label: 'API Access', icon: Activity },
                                            { id: 'link', label: 'Website Link', icon: Globe }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveIntegration(item.id as 'api' | 'link')}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeIntegration === item.id
                                                    ? 'bg-[#2ECFFF]/10 border-[#2ECFFF]/40 text-white'
                                                    : 'bg-black/20 border-white/5 text-[#8FAEC6] hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${activeIntegration === item.id ? 'bg-[#2ECFFF] text-[#0B1C2D]' : 'bg-[#2ECFFF]/10 text-[#2ECFFF]'}`}>
                                                    <item.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between text-[9px] text-[#6B8BA4] mb-2 font-bold tracking-widest uppercase">
                                            <span>Active Plan</span>
                                            <span className="text-[#2DFF9A]">Online</span>
                                        </div>
                                        <button
                                            onClick={() => handleSetPlan(null)}
                                            className="w-full flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5 hover:border-[#2ECFFF]/30 transition-all"
                                        >
                                            <span className="text-[10px] text-[#2ECFFF] font-bold uppercase">{selectedPlan}</span>
                                            <ChevronRight className="w-3 h-3 text-[#6B8BA4]" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side: Deployment Interface */}
                            <motion.div
                                key={activeIntegration}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 w-full"
                            >
                                {activeIntegration === 'api' ? (
                                    <IntegrationSelection
                                        planName={selectedPlan!}
                                        onBack={() => handleSetPlan(null)}
                                        onSelectMethod={() => { }}
                                        autoShowApi={true}
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-[#050E18] border border-[#2ECFFF]/20 rounded-2xl p-6 relative overflow-hidden group shadow-xl">
                                            <div className="absolute top-0 right-0 p-24 bg-[#5ED8F5]/5 rounded-full blur-3xl" />
                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-xl bg-[#5ED8F5]/10 border border-[#5ED8F5]/20 text-[#5ED8F5]">
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Direct Verification Link</h3>
                                                        <p className="text-[11px] text-[#8FAEC6]">No-code biometric onboarding</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await apiKeyService.createVerificationSession();
                                                            toast.success('Secure link generated! It will appear in the report below.');
                                                            // The report below (WebsiteLinkReport) polls for data, 
                                                            // so it should pick up the new session automatically if it's connected.
                                                        } catch (error) {
                                                            toast.error('Failed to generate link');
                                                        }
                                                    }}
                                                    className="px-6 py-2 rounded-lg bg-[#2ECFFF] hover:bg-[#5ED8F5] text-[#0B1C2D] text-xs font-bold transition-all"
                                                >
                                                    Generate New Link
                                                </button>
                                            </div>
                                        </div>
                                        <WebsiteLinkReport />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Intelligence Monitor (Always Visible) */}
                <div className="mt-12 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-0.5 tracking-tight">Service Intelligence</h2>
                            <p className="text-[9px] text-[#2ECFFF] font-mono uppercase tracking-[0.4em]">Forensic Forensic Monitoring</p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#2ECFFF]/10 px-3 py-1.5 rounded-full border border-[#2ECFFF]/20">
                            <Activity className="w-3 h-3 text-[#2ECFFF]" />
                            <span className="text-[9px] text-white font-bold uppercase tracking-widest">Live Security Feed</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Summary Cards (Only in API view) */}
                        {activeIntegration === 'api' && (
                            <div className="space-y-4">
                                <StatsDashboard showOnly="cards" />
                            </div>
                        )}

                        {/* Security Event Logs (Unified) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-1 px-2.5 rounded-md bg-red-500/10 border border-red-500/20 w-fit">
                                <ShieldAlert className="w-3 h-3 text-red-400" />
                                <span className="text-red-400 text-[8px] font-bold uppercase tracking-widest">security audit logs</span>
                            </div>
                            <StatsDashboard showOnly="logs" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative border-t border-[#2ECFFF]/30 bg-[#0B1C2D]/80 backdrop-blur-md mt-24 z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[#8FAEC6] text-sm">
                            © 2026 Face Secure. Enterprise-grade biometric security.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-[#2ECFFF] hover:text-[#5ED8F5] transition-colors">Privacy Policy</a>
                            <a href="#" className="text-[#2ECFFF] hover:text-[#5ED8F5] transition-colors">Terms of Service</a>
                            <a href="#" className="text-[#2ECFFF] hover:text-[#5ED8F5] transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
