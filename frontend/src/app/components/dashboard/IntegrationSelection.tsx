import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, ExternalLink, Check, ArrowLeft, Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { ApiKeyDashboard } from './ApiKeyDashboard';
import { WebsiteLinkReport } from './WebsiteLinkReport';
import { apiKeyService } from '../../services/apiKeyService';

interface IntegrationSelectionProps {
    onBack: () => void;
    onSelectMethod: (method: 'api' | 'link') => void;
    planName: string;
    autoShowApi?: boolean;
}

export function IntegrationSelection({ onBack, onSelectMethod, planName, autoShowApi }: IntegrationSelectionProps) {
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [showApiDashboard, setShowApiDashboard] = useState(autoShowApi || false);

    const handleGenerateLink = async () => {
        try {
            const response = await apiKeyService.createVerificationSession();
            // Backend returns verification_url which includes the session ID
            setGeneratedLink(response.verification_url);
            toast.success('Secure verification session created!');
        } catch (error) {
            console.error('Failed to create session:', error);
            toast.error('Failed to generate secure link. Please try again.');
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            toast.success('Link copied to clipboard');
        }
    };

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

    // Show API Key Dashboard when "Get API Access" is clicked
    if (showApiDashboard) {
        return (
            <ApiKeyDashboard
                onBack={() => setShowApiDashboard(false)}
                planName={planName}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            {!autoShowApi && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#2ECFFF] hover:text-[#5ED8F5] transition-colors mb-6 group text-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Plans
                </motion.button>
            )}

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="text-center mb-12"
            >
                <motion.h2 variants={item} className="text-4xl text-white mb-4 font-bold">
                    Start Integration
                </motion.h2>
                <motion.p variants={item} className="text-[#8FAEC6] text-lg max-w-2xl mx-auto">
                    You've selected the <span className="text-[#2ECFFF]">{planName}</span> plan.
                    Choose how you want to integrate FaceSecure.
                </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
                {!generatedLink ? (
                    <motion.div
                        key="selection"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* API Option */}
                        <motion.div variants={item}>
                            <Card className="relative h-full bg-[#050E18] border-2 border-[#2ECFFF]/30 hover:border-[#2ECFFF] transition-colors p-8 flex flex-col group overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-[#2ECFFF]/5 rounded-full blur-3xl group-hover:bg-[#2ECFFF]/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ECFFF] to-[#050E18] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(31,182,201,0.3)]">
                                        <Code className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-4">Use API</h3>
                                    <p className="text-[#8FAEC6] mb-8 min-h-[48px]">
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
                                                <Check className="w-4 h-4 text-[#2ECFFF]" />
                                                <span className="text-sm text-[#8FAEC6]">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto">
                                        <Button
                                            onClick={() => {
                                                setShowApiDashboard(true);
                                                onSelectMethod('api');
                                            }}
                                            className="w-full bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold py-6 text-lg"
                                        >
                                            Get API Access
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Website Link Option */}
                        <motion.div variants={item}>
                            <Card className="relative h-full bg-[#050E18] border-2 border-[#2ECFFF]/30 hover:border-[#2ECFFF] transition-colors p-8 flex flex-col group overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-[#5ED8F5]/5 rounded-full blur-3xl group-hover:bg-[#5ED8F5]/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5ED8F5] to-[#050E18] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(111,234,255,0.3)]">
                                        <ExternalLink className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-4">Use Website Link</h3>
                                    <p className="text-[#8FAEC6] mb-8 min-h-[48px]">
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
                                                <Check className="w-4 h-4 text-[#2ECFFF]" />
                                                <span className="text-sm text-[#8FAEC6]">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto">
                                        <Button
                                            onClick={handleGenerateLink}
                                            className="w-full bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold py-6 text-lg"
                                        >
                                            Generate Link
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <WebsiteLinkReport
                            generatedLink={generatedLink}
                            onReset={() => setGeneratedLink(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
