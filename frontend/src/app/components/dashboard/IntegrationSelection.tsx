import { motion } from 'motion/react';
import { Code, ExternalLink, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface IntegrationSelectionProps {
    onBack: () => void;
    onSelectMethod: (method: 'api' | 'link') => void;
    planName: string;
}

export function IntegrationSelection({ onBack, onSelectMethod, planName }: IntegrationSelectionProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="flex items-center gap-2 text-[#3DD5E7] hover:text-[#6FEAFF] transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Plans
            </motion.button>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="text-center mb-12"
            >
                <motion.h2 variants={item} className="text-4xl text-white mb-4 font-bold">
                    Start Integration
                </motion.h2>
                <motion.p variants={item} className="text-gray-400 text-lg max-w-2xl mx-auto">
                    You've selected the <span className="text-[#3DD5E7]">{planName}</span> plan.
                    Choose how you want to integrate FaceSecure.
                </motion.p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* API Option */}
                <motion.div variants={item}>
                    <Card className="relative h-full bg-[#0A2A44] border-2 border-[#1FB6C9]/30 hover:border-[#1FB6C9] transition-colors p-8 flex flex-col group overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-[#1FB6C9]/5 rounded-full blur-3xl group-hover:bg-[#1FB6C9]/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1FB6C9] to-[#0A2A44] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(31,182,201,0.3)]">
                                <Code className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4">Use API</h3>
                            <p className="text-gray-300 mb-8 min-h-[48px]">
                                Integrate FaceSecure directly into your application with our powerful RESTful API.
                            </p>

                            <div className="space-y-3 mb-8">
                                {[
                                    'Full programmatic control',
                                    'Real-time biometric verification',
                                    'Webhook notifications',
                                    'Extensive documentation',
                                    'SDK support for multiple languages'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-[#3DD5E7]" />
                                        <span className="text-sm text-gray-400">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Button
                                    onClick={() => onSelectMethod('api')}
                                    className="w-full bg-[#1FB6C9] hover:bg-[#3DD5E7] text-[#071C2F] font-bold py-6 text-lg"
                                >
                                    Get API Access
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Website Link Option */}
                <motion.div variants={item}>
                    <Card className="relative h-full bg-[#0A2A44] border-2 border-[#1FB6C9]/30 hover:border-[#1FB6C9] transition-colors p-8 flex flex-col group overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-[#6FEAFF]/5 rounded-full blur-3xl group-hover:bg-[#6FEAFF]/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6FEAFF] to-[#0A2A44] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(111,234,255,0.3)]">
                                <ExternalLink className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4">Use Website Link</h3>
                            <p className="text-gray-300 mb-8 min-h-[48px]">
                                Share a secure verification link with users for quick and easy biometric authentication.
                            </p>

                            <div className="space-y-3 mb-8">
                                {[
                                    'No coding required',
                                    'Instant setup and deployment',
                                    'Shareable secure links',
                                    'Mobile-friendly interface',
                                    'Automated result notifications'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-[#3DD5E7]" />
                                        <span className="text-sm text-gray-400">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Button
                                    onClick={() => onSelectMethod('link')}
                                    className="w-full bg-[#1FB6C9] hover:bg-[#3DD5E7] text-[#071C2F] font-bold py-6 text-lg"
                                >
                                    Generate Link
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
