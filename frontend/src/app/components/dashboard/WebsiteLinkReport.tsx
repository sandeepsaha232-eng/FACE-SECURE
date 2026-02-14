import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle, XCircle, TrendingUp, Users, Clock, Copy, ArrowRight, RefreshCw, Link as LinkIcon, ExternalLink, Monitor } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { apiKeyService, AnalyticsData } from '../../services/apiKeyService';

interface WebsiteLinkReportProps {
    generatedLink?: string | null;
    onReset?: () => void;
}

export function WebsiteLinkReport({ generatedLink, onReset }: WebsiteLinkReportProps) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            toast.success('Link copied to clipboard');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiKeyService.getAnalytics();
                if (response.success) setAnalytics(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        {
            label: 'Total Verifications',
            value: analytics?.totalVerifications || 0,
            icon: Users,
            color: 'text-[#2ECFFF]',
        },
        {
            label: 'Verified',
            value: `${analytics?.verifiedPercent || 0}%`,
            icon: CheckCircle,
            color: 'text-[#2DFF9A]',
        },
        {
            label: 'Rejected',
            value: `${analytics?.rejectedPercent || 0}%`,
            icon: XCircle,
            color: 'text-red-400',
        },
        {
            label: 'Avg Confidence',
            value: analytics?.avgConfidence || 0,
            icon: TrendingUp,
            color: 'text-amber-400',
        },
        {
            label: 'Last Browser',
            value: analytics?.lastBrowser || 'N/A',
            icon: Monitor,
            color: 'text-violet-400',
        },
    ];

    if (loading && !analytics && !generatedLink) {
        return (
            <div className="flex items-center justify-center p-12">
                <Activity className="w-6 h-6 text-[#2ECFFF] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-4"
        >
            {/* Link Management Section */}
            {generatedLink && (
                <Card className="bg-[#0B1C2D] border border-[#2ECFFF]/40 p-4 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 bg-[#2ECFFF]/5 rounded-full blur-3xl group-hover:bg-[#2ECFFF]/10 transition-colors" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#2ECFFF]/10 flex items-center justify-center border border-[#2ECFFF]/20">
                                    <LinkIcon className="w-5 h-5 text-[#2ECFFF]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Secure Access Link</h3>
                                    <p className="text-[#6B8BA4] text-[10px]">Onboard users with instant biometric verification</p>
                                </div>
                            </div>

                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="text-[#6B8BA4] hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
                                >
                                    Reset Link
                                </button>
                            )}
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                            <code className="text-[#2ECFFF] font-mono text-[11px] break-all w-full md:w-auto px-2">
                                {generatedLink}
                            </code>
                            <div className="flex gap-2 w-full md:w-auto shrink-0">
                                <Button
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex-1 md:flex-none h-8 px-3 text-[10px] bg-[#2ECFFF]/10 text-[#2ECFFF] hover:bg-[#2ECFFF] hover:text-[#0B1C2D] border border-[#2ECFFF]/20"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    Copy
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => window.open(generatedLink, '_blank')}
                                    className="flex-1 md:flex-none h-8 px-3 text-[10px] bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                    Open
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Live Monitor Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-[#2ECFFF]" />
                        <h4 className="text-white font-bold text-sm tracking-tight uppercase">Live Link Performance</h4>
                    </div>
                    {analytics && (
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-[#2DFF9A] animate-pulse" />
                            <span className="text-[#2DFF9A] text-[9px] font-bold uppercase tracking-widest">Active Monitoring</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <Card className="bg-[#0B1C2D] border border-[#2ECFFF]/20 p-3.5 hover:border-[#2ECFFF]/40 transition-all flex flex-col justify-between h-full min-h-[80px]">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[#6B8BA4] text-[8px] uppercase tracking-widest font-black">{stat.label}</p>
                                    <stat.icon className={`w-3 h-3 ${stat.color} opacity-60`} />
                                </div>
                                <p className={`text-lg font-black ${stat.color} tracking-tight`}>
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Progress bar */}
                {analytics && analytics.totalVerifications > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-[#0B1C2D] border border-[#2ECFFF]/10 rounded-xl p-3"
                    >
                        <div className="flex items-center justify-between text-[8px] text-[#6B8BA4] uppercase tracking-[0.2em] mb-2 font-bold">
                            <span>Verification Health</span>
                            <span className="text-[#8FAEC6]">{analytics.totalVerifications} EVENTS</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex mb-2">
                            <div
                                className="h-full bg-[#2DFF9A] transition-all duration-700"
                                style={{ width: `${analytics.verifiedPercent}%` }}
                            />
                            <div
                                className="h-full bg-red-500 transition-all duration-700"
                                style={{ width: `${analytics.rejectedPercent}%` }}
                            />
                            <div
                                className="h-full bg-amber-500 transition-all duration-700"
                                style={{ width: `${analytics.retryRate}%` }}
                            />
                        </div>

                        <div className="flex gap-4 text-[8px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-[#2DFF9A] rounded-full" />
                                <span className="text-[#8FAEC6]">Success {analytics.verifiedPercent}%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <span className="text-[#8FAEC6]">Blocked {analytics.rejectedPercent}%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                <span className="text-[#8FAEC6]">Retries {analytics.retryRate}%</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
