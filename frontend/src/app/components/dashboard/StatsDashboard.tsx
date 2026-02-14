import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Fingerprint, ShieldAlert, Activity, Globe, Clock, History, ExternalLink, Monitor, MapPin, Lock } from 'lucide-react';
import { statsService } from '../../services/statsService';

interface StatData {
    totalUsers: number;
    totalFaces: number;
    failedAttempts: number;
    recentActivity: Array<{
        id: string;
        timestamp: string;
        success: boolean;
        failureReason?: string;
        userName: string;
        type: 'auth' | 'verification';
        faceImage?: string;
        browser?: string;
        ipAddress?: string;
        location?: { city: string; country: string };
        deviceType?: string;
        isEncrypted?: boolean;
    }>;
}

export function StatsDashboard({ showOnly }: { showOnly?: 'cards' | 'logs' }) {
    const [stats, setStats] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFace, setSelectedFace] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const response = await statsService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center p-24">
                <Activity className="w-12 h-12 text-[#2ECFFF] animate-spin" />
            </div>
        );
    }

    const cards = [
        { title: 'Registered Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
        { title: 'Biometric Profiles', value: stats?.totalFaces || 0, icon: Fingerprint, color: 'text-[#2DFF9A]' },
        { title: 'Failed Verifications', value: stats?.failedAttempts || 0, icon: ShieldAlert, color: 'text-red-400' }
    ];

    return (
        <div className="space-y-12">
            {/* Stats Overview */}
            {(!showOnly || showOnly === 'cards') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#050E18] border-2 border-[#2ECFFF]/20 p-5 rounded-2xl relative overflow-hidden group hover:border-[#2ECFFF]/50 transition-all shadow-lg"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[#8FAEC6] text-[10px] font-medium mb-0.5 uppercase tracking-wider">{card.title}</p>
                                    <h3 className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl bg-[#0B1C2D] ${card.color} border border-white/5`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Activity Logs */}
            {(!showOnly || showOnly === 'logs') && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#050E18] border border-[#2ECFFF]/20 rounded-2xl overflow-hidden shadow-xl"
                >
                    <div className="p-5 border-b border-[#2ECFFF]/20 flex items-center justify-between bg-[#0B1C2D]/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#2ECFFF]/10 border border-[#2ECFFF]/20">
                                <History className="w-4 h-4 text-[#2ECFFF]" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white uppercase tracking-tight">Security Event Logs</h3>
                                <p className="text-[10px] text-[#6B8BA4]">Real-time authentication monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0B1C2D]/30 text-[#8FAEC6] text-[9px] uppercase tracking-[0.2em] font-bold">
                                    <th className="px-6 py-4">User / Candidate</th>
                                    <th className="px-6 py-4">Device</th>
                                    <th className="px-6 py-4">Location / IP</th>
                                    <th className="px-6 py-4">Face Scan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Result / Detail</th>
                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2ECFFF]/10">
                                <AnimatePresence>
                                    {stats?.recentActivity.map((activity) => (
                                        <motion.tr
                                            key={activity.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#2ECFFF]/10 border border-[#2ECFFF]/30 flex items-center justify-center">
                                                        {activity.type === 'verification' ? (
                                                            <ExternalLink className="w-3 h-3 text-[#2ECFFF]" />
                                                        ) : (
                                                            <Users className="w-3 h-3 text-[#2ECFFF]" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-xs font-medium">{activity.userName}</span>
                                                        <span className="text-[9px] text-[#6B8BA4] font-mono uppercase tracking-wider">
                                                            {activity.type === 'verification' ? 'Guest Link' : 'App Login'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[#8FAEC6] group-hover:text-white transition-colors">
                                                        <Monitor className="w-3 h-3 text-[#2ECFFF]" />
                                                        <span className="text-[10px] font-semibold">{activity.deviceType || 'Mac'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-[#8FAEC6] group-hover:text-white transition-colors">
                                                        <MapPin className="w-3 h-3 text-[#2DFF9A]" />
                                                        <span className="text-[10px] font-medium">{activity.location?.city || 'Delhi'}, {activity.location?.country || 'IN'}</span>
                                                    </div>
                                                    <span className="text-[9px] text-[#6B8BA4] font-mono pl-4.5">{activity.ipAddress || '8.8.8.8'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {activity.faceImage ? (
                                                    <div
                                                        onClick={() => setSelectedFace(activity.faceImage!)}
                                                        className="w-8 h-8 rounded-md bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:border-[#2ECFFF] transition-all relative group/face"
                                                    >
                                                        <img src={activity.faceImage} alt="face" className="w-full h-full object-cover grayscale group-hover/face:grayscale-0 transition-all" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#6B8BA4] italic text-[8px]">Empty</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {activity.success ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-[#2DFF9A]/10 border border-emerald-500/20 text-[#2DFF9A] text-[9px] font-bold uppercase tracking-wider">OK</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider">Fail</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className={`text-[10px] ${activity.type === 'verification' ? 'text-[#2ECFFF]' : 'text-[#8FAEC6]'}`}>
                                                        {activity.success ? 'Validated' : activity.failureReason || 'Failed'}
                                                    </div>
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2DFF9A]/5 border border-emerald-500/10 w-fit">
                                                        <Lock className="w-2.5 h-2.5 text-[#2DFF9A]/50" />
                                                        <span className="text-[8px] text-[#2DFF9A]/50 font-bold uppercase tracking-widest whitespace-nowrap">E2E</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-[10px] text-[#6B8BA4] font-mono uppercase">
                                                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Face Preview Modal */}
            <AnimatePresence>
                {selectedFace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedFace(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative max-w-lg w-full bg-[#0B1C2D] border border-[#2ECFFF]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(31,182,201,0.2)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="aspect-square w-full relative">
                                <img src={selectedFace} alt="Enlarged Audit Capture" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2D] via-transparent to-transparent" />
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#2DFF9A] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-[10px] text-[#2ECFFF] font-mono tracking-widest uppercase">HD Audit Capture</div>
                                </div>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-[#0B1C2D]">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Verification Audit Scan</h3>
                                    <p className="text-[#2ECFFF] text-sm">Real-time Biometric Evidence</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFace(null)}
                                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
