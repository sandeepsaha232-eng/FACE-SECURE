import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Key, BarChart3, PieChart, Webhook, Shield, Plus, Copy, RotateCcw,
    Ban, Eye, Check, X, Clock, Activity, TrendingUp, AlertTriangle,
    ArrowLeft, RefreshCw, Globe, Lock, Trash2, ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { apiKeyService, ApiKeyData, KeyUsageData, AnalyticsData } from '../../services/apiKeyService';

interface ApiKeyDashboardProps {
    onBack: () => void;
    planName: string;
}

type TabId = 'keys' | 'usage' | 'analytics' | 'webhooks' | 'security';

const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Usage & Limits', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'security', label: 'Security', icon: Shield },
];

export function ApiKeyDashboard({ onBack, planName }: ApiKeyDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabId>('keys');
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
    const [usageData, setUsageData] = useState<KeyUsageData | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [creating, setCreating] = useState(false);

    const fetchKeys = useCallback(async () => {
        try {
            const response = await apiKeyService.listKeys();
            if (response.success) setKeys(response.data);
        } catch (error) {
            console.error('Failed to fetch keys:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await apiKeyService.getAnalytics();
            if (response.success) setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
        fetchAnalytics();
    }, [fetchKeys, fetchAnalytics]);

    const handleCreateKey = async () => {
        setCreating(true);
        try {
            const response = await apiKeyService.createKey({ name: 'My API Key', environment: 'live' });
            if (response.success) {
                setNewKeySecret(response.data.key);
                toast.success('API key created! Save it now — it won\'t be shown again.');
                fetchKeys();
            }
        } catch (error) {
            toast.error('Failed to create API key');
        } finally {
            setCreating(false);
        }
    };

    const handleRotateKey = async (id: string) => {
        try {
            const response = await apiKeyService.rotateKey(id);
            if (response.success) {
                setNewKeySecret(response.data.key);
                toast.success('Key rotated! Old key revoked. Save the new key.');
                fetchKeys();
            }
        } catch (error) {
            toast.error('Failed to rotate key');
        }
    };

    const handleDisableKey = async (id: string) => {
        try {
            const response = await apiKeyService.disableKey(id);
            if (response.success) {
                toast.success(`Key ${response.data.status}`);
                fetchKeys();
            }
        } catch (error) {
            toast.error('Failed to toggle key status');
        }
    };

    const handleViewUsage = async (id: string) => {
        setSelectedKeyId(id);
        setActiveTab('usage');
        try {
            const response = await apiKeyService.getKeyUsage(id);
            if (response.success) setUsageData(response.data);
        } catch (error) {
            toast.error('Failed to load usage data');
        }
    };

    const handleUpdateWebhook = async (id: string, url: string, retryPolicy: string) => {
        try {
            await apiKeyService.updateKey(id, { webhookUrl: url, webhookRetryPolicy: retryPolicy } as any);
            toast.success('Webhook settings updated');
            fetchKeys();
        } catch (error) {
            toast.error('Failed to update webhook');
        }
    };

    const handleUpdateSecurity = async (id: string, field: string, value: any) => {
        try {
            await apiKeyService.updateKey(id, { [field]: value } as any);
            toast.success('Security settings updated');
            fetchKeys();
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[#2ECFFF] hover:text-[#5ED8F5] transition-colors mb-4 group text-[10px] uppercase font-bold tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">API Key Management</h2>
                        <p className="text-[10px] text-[#6B8BA4] mt-0.5">
                            Active Plan: <span className="text-[#2ECFFF] font-bold">{planName}</span>
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateKey}
                        disabled={creating}
                        className="bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold px-4 h-9 flex items-center gap-2 text-[11px]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {creating ? 'Creating...' : 'New API Key'}
                    </Button>
                </div>
            </motion.div>

            {/* New Key Banner */}
            <AnimatePresence>
                {newKeySecret && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="mb-6"
                    >
                        <Card className="bg-[#2DFF9A]/10 border-2 border-emerald-500/30 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-[#2DFF9A]" />
                                        <h3 className="text-[#2DFF9A] font-bold">Your API Key (shown once)</h3>
                                    </div>
                                    <div className="bg-[#0B1C2D] rounded-lg p-3 flex items-center justify-between gap-4 font-mono text-sm">
                                        <span className="text-[#5ED8F5] break-all">{newKeySecret}</span>
                                        <button
                                            onClick={() => copyToClipboard(newKeySecret)}
                                            className="flex-shrink-0 p-2 rounded bg-[#2ECFFF]/10 text-[#2ECFFF] hover:bg-[#2ECFFF] hover:text-[#0B1C2D] transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[#8FAEC6] text-xs mt-2">
                                        ⚠️ Store this key securely. It will not be displayed again.
                                    </p>
                                </div>
                                <button onClick={() => setNewKeySecret(null)} className="text-[#6B8BA4] hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#0B1C2D]/50 p-1 rounded-xl border border-[#2ECFFF]/10 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-[#2ECFFF] text-[#0B1C2D]'
                            : 'text-[#6B8BA4] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'keys' && (
                    <KeysTab
                        keys={keys}
                        loading={loading}
                        onRotate={handleRotateKey}
                        onDisable={handleDisableKey}
                        onViewUsage={handleViewUsage}
                        onCopy={copyToClipboard}
                    />
                )}
                {activeTab === 'usage' && (
                    <UsageTab
                        usageData={usageData}
                        keys={keys}
                        selectedKeyId={selectedKeyId}
                        onSelectKey={handleViewUsage}
                    />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab analytics={analytics} onRefresh={fetchAnalytics} />
                )}
                {activeTab === 'webhooks' && (
                    <WebhooksTab keys={keys} onUpdate={handleUpdateWebhook} />
                )}
                {activeTab === 'security' && (
                    <SecurityTab keys={keys} onUpdate={handleUpdateSecurity} />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ================================= TAB COMPONENTS ================================= */

function KeysTab({ keys, loading, onRotate, onDisable, onViewUsage, onCopy }: {
    keys: ApiKeyData[];
    loading: boolean;
    onRotate: (id: string) => void;
    onDisable: (id: string) => void;
    onViewUsage: (id: string) => void;
    onCopy: (text: string) => void;
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Activity className="w-8 h-8 text-[#2ECFFF] animate-spin" />
            </div>
        );
    }

    if (keys.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
            >
                <Key className="w-16 h-16 text-[#6B8BA4] mx-auto mb-4" />
                <h3 className="text-xl text-[#8FAEC6] mb-2">No API keys yet</h3>
                <p className="text-[#6B8BA4]">Create your first API key to start integrating.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="keys-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            {keys.map((apiKey, i) => (
                <motion.div
                    key={apiKey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="bg-[#050E18] border border-[#2ECFFF]/10 hover:border-[#2ECFFF]/30 transition-all p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            {/* Key Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${apiKey.status === 'active' ? 'bg-[#2DFF9A]/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                        <Key className={`w-4 h-4 ${apiKey.status === 'active' ? 'text-[#2DFF9A]' : 'text-red-400'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">{apiKey.name}</h4>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[#6B8BA4] font-mono">{apiKey.keyId}</span>
                                            <button onClick={() => onCopy(apiKey.keyId)} className="text-[#6B8BA4] hover:text-[#2ECFFF]">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apiKey.environment === 'live'
                                        ? 'bg-[#2DFF9A]/10 border border-emerald-500/20 text-[#2DFF9A]'
                                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                        }`}>
                                        {apiKey.environment}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apiKey.status === 'active'
                                        ? 'bg-[#2DFF9A]/10 border border-emerald-500/20 text-[#2DFF9A]'
                                        : apiKey.status === 'suspended'
                                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        }`}>
                                        {apiKey.status}
                                    </span>
                                    <span className="text-[10px] text-[#6B8BA4] flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                    </span>
                                    {apiKey.lastUsedAt && (
                                        <span className="text-[10px] text-[#6B8BA4] flex items-center gap-1">
                                            <Activity className="w-3 h-3" />
                                            Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-[#2ECFFF] flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {apiKey.monthlyUsage.toLocaleString()} this month
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => onViewUsage(apiKey.id)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-[#2ECFFF] hover:border-[#2ECFFF]/30 transition-all text-xs flex items-center gap-1.5"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Usage
                                </button>
                                <button
                                    onClick={() => onRotate(apiKey.id)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-amber-400 hover:border-amber-400/30 transition-all text-xs flex items-center gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Rotate
                                </button>
                                <button
                                    onClick={() => onDisable(apiKey.id)}
                                    className={`px-3 py-2 rounded-lg bg-white/5 border border-white/10 transition-all text-xs flex items-center gap-1.5 ${apiKey.status === 'suspended'
                                        ? 'text-[#2DFF9A] hover:border-emerald-400/30'
                                        : 'text-[#8FAEC6] hover:text-red-400 hover:border-red-400/30'
                                        }`}
                                >
                                    <Ban className="w-3.5 h-3.5" />
                                    {apiKey.status === 'suspended' ? 'Enable' : 'Disable'}
                                </button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}

function UsageTab({ usageData, keys, selectedKeyId, onSelectKey }: {
    usageData: KeyUsageData | null;
    keys: ApiKeyData[];
    selectedKeyId: string | null;
    onSelectKey: (id: string) => void;
}) {
    const activeKeys = keys.filter((k) => k.status !== 'revoked');

    return (
        <motion.div
            key="usage-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Key Selector */}
            <div className="flex items-center gap-4">
                <span className="text-[#8FAEC6] text-sm">Select key:</span>
                <div className="flex gap-2 flex-wrap">
                    {activeKeys.map((k) => (
                        <button
                            key={k.id}
                            onClick={() => onSelectKey(k.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedKeyId === k.id
                                ? 'bg-[#2ECFFF] text-[#0B1C2D]'
                                : 'bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-white'
                                }`}
                        >
                            {k.name} ({k.keyId})
                        </button>
                    ))}
                </div>
            </div>

            {!usageData ? (
                <div className="text-center py-16 text-[#6B8BA4]">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#6B8BA4]" />
                    <p>Select a key to view usage statistics</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Daily Requests', value: usageData.dailyUsage, color: 'text-blue-400' },
                            { label: 'Monthly Requests', value: usageData.monthlyUsage, color: 'text-[#2ECFFF]' },
                            { label: 'Success Rate', value: `${usageData.successRate}%`, color: 'text-[#2DFF9A]' },
                            { label: 'Avg Confidence', value: usageData.avgConfidence, color: 'text-amber-400' },
                        ].map((stat, i) => (
                            <Card key={i} className="bg-[#050E18] border border-[#2ECFFF]/20 p-5">
                                <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Session Breakdown */}
                    <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                        <h4 className="text-white font-bold mb-4">Session Breakdown</h4>
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-[#2DFF9A] text-3xl font-bold">{usageData.verifiedSessions}</p>
                                <p className="text-[#8FAEC6] text-sm">Verified</p>
                            </div>
                            <div>
                                <p className="text-red-400 text-3xl font-bold">{usageData.rejectedSessions}</p>
                                <p className="text-[#8FAEC6] text-sm">Rejected</p>
                            </div>
                            <div>
                                <p className="text-amber-400 text-3xl font-bold">{usageData.pendingSessions}</p>
                                <p className="text-[#8FAEC6] text-sm">Pending</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="w-full h-3 bg-[#0B1C2D] rounded-full overflow-hidden flex">
                                {usageData.totalSessions > 0 && (
                                    <>
                                        <div
                                            className="h-full bg-[#2DFF9A] transition-all"
                                            style={{ width: `${(usageData.verifiedSessions / usageData.totalSessions) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500 transition-all"
                                            style={{ width: `${(usageData.rejectedSessions / usageData.totalSessions) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-amber-500 transition-all"
                                            style={{ width: `${(usageData.pendingSessions / usageData.totalSessions) * 100}%` }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Recent Sessions */}
                    <Card className="bg-[#050E18] border border-[#2ECFFF]/20 overflow-hidden">
                        <div className="p-6 border-b border-[#2ECFFF]/10">
                            <h4 className="text-white font-bold">Recent Sessions</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#6B8BA4] text-xs uppercase tracking-wider">
                                        <th className="px-6 py-3">Session ID</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Confidence</th>
                                        <th className="px-6 py-3">Signals</th>
                                        <th className="px-6 py-3 text-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2ECFFF]/10">
                                    {usageData.recentSessions.map((session) => (
                                        <tr key={session.sessionId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-[#2ECFFF]">{session.sessionId}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${session.status === 'verified' ? 'bg-[#2DFF9A]/10 text-[#2DFF9A]'
                                                    : session.status === 'rejected' ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-bold">{session.confidence}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 text-[10px]">
                                                    <span className={session.signals.liveness === 'pass' ? 'text-[#2DFF9A]' : 'text-[#6B8BA4]'}>
                                                        L:{session.signals.liveness}
                                                    </span>
                                                    <span className={session.signals.replay === 'none' ? 'text-[#2DFF9A]' : 'text-red-400'}>
                                                        R:{session.signals.replay}
                                                    </span>
                                                    <span className={session.signals.behavior === 'normal' ? 'text-[#2DFF9A]' : 'text-red-400'}>
                                                        B:{session.signals.behavior}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-[#6B8BA4]">
                                                {new Date(session.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {usageData.recentSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[#6B8BA4]">
                                                No sessions yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </motion.div>
    );
}

function AnalyticsTab({ analytics, onRefresh }: { analytics: AnalyticsData | null; onRefresh: () => void }) {
    return (
        <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Verification Analytics</h3>
                <button
                    onClick={onRefresh}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-[#2ECFFF] transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {!analytics ? (
                <div className="text-center py-16">
                    <Activity className="w-8 h-8 text-[#2ECFFF] animate-spin mx-auto" />
                </div>
            ) : (
                <>
                    {/* Main Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                            <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Total Verifications</p>
                            <p className="text-4xl font-bold text-white">{analytics.totalVerifications.toLocaleString()}</p>
                        </Card>
                        <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                            <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Verified</p>
                            <p className="text-4xl font-bold text-[#2DFF9A]">{analytics.verifiedPercent}%</p>
                            <p className="text-[#6B8BA4] text-xs mt-1">{analytics.verifiedCount} sessions</p>
                        </Card>
                        <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                            <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Rejected</p>
                            <p className="text-4xl font-bold text-red-400">{analytics.rejectedPercent}%</p>
                            <p className="text-[#6B8BA4] text-xs mt-1">{analytics.rejectedCount} sessions</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                            <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Avg Confidence Score</p>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-bold text-[#2ECFFF]">{analytics.avgConfidence}</p>
                                <p className="text-[#6B8BA4] text-sm mb-1">/ 100</p>
                            </div>
                            <div className="mt-4 w-full h-2 bg-[#0B1C2D] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] rounded-full transition-all"
                                    style={{ width: `${analytics.avgConfidence}%` }}
                                />
                            </div>
                        </Card>
                        <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                            <p className="text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Retry Rate</p>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-bold text-amber-400">{analytics.retryRate}%</p>
                            </div>
                            <p className="text-[#6B8BA4] text-xs mt-3">
                                Sessions still pending or requiring re-verification
                            </p>
                        </Card>
                    </div>

                    {/* Visual Breakdown */}
                    <Card className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                        <h4 className="text-white font-bold mb-4">Outcome Distribution</h4>
                        <div className="flex items-center gap-6">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        className="text-[#0B1C2D]"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        cx="18" cy="18" r="15.9155"
                                    />
                                    <circle
                                        className="text-[#2DFF9A]"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeDasharray={`${analytics.verifiedPercent} ${100 - analytics.verifiedPercent}`}
                                        strokeDashoffset="0"
                                        fill="none"
                                        cx="18" cy="18" r="15.9155"
                                    />
                                    <circle
                                        className="text-red-500"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeDasharray={`${analytics.rejectedPercent} ${100 - analytics.rejectedPercent}`}
                                        strokeDashoffset={`${-analytics.verifiedPercent}`}
                                        fill="none"
                                        cx="18" cy="18" r="15.9155"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{analytics.totalVerifications}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-[#2DFF9A] rounded-full" />
                                    <span className="text-[#8FAEC6] text-sm">Verified ({analytics.verifiedPercent}%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span className="text-[#8FAEC6] text-sm">Rejected ({analytics.rejectedPercent}%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                    <span className="text-[#8FAEC6] text-sm">Pending ({analytics.retryRate}%)</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </motion.div>
    );
}

function WebhooksTab({ keys, onUpdate }: {
    keys: ApiKeyData[];
    onUpdate: (id: string, url: string, retryPolicy: string) => void;
}) {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [retryPolicy, setRetryPolicy] = useState('once');

    const activeKeys = keys.filter((k) => k.status !== 'revoked');

    const startEdit = (key: ApiKeyData) => {
        setEditingKey(key.id);
        setWebhookUrl(key.webhookUrl || '');
        setRetryPolicy(key.webhookRetryPolicy || 'once');
    };

    return (
        <motion.div
            key="webhooks-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Webhook Configuration</h3>
                <p className="text-[#6B8BA4] text-sm">
                    Receive real-time notifications when verification sessions complete.
                    Each API key has its own webhook secret — never reuse API keys for webhooks.
                </p>
            </div>

            {activeKeys.map((apiKey) => (
                <Card key={apiKey.id} className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Webhook className="w-5 h-5 text-[#2ECFFF]" />
                            <h4 className="text-white font-semibold">{apiKey.name}</h4>
                            <span className="text-[#6B8BA4] text-xs font-mono">{apiKey.keyId}</span>
                        </div>
                        {editingKey !== apiKey.id && (
                            <button
                                onClick={() => startEdit(apiKey)}
                                className="text-[#2ECFFF] text-sm hover:underline"
                            >
                                Configure
                            </button>
                        )}
                    </div>

                    {editingKey === apiKey.id ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[#8FAEC6] text-xs uppercase tracking-wider block mb-2">Webhook URL</label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://your-server.com/webhook"
                                    className="w-full bg-[#0B1C2D] border border-[#2ECFFF]/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#2ECFFF] focus:outline-none transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[#8FAEC6] text-xs uppercase tracking-wider block mb-2">Retry Policy</label>
                                <div className="flex gap-2">
                                    {['none', 'once', 'twice', 'thrice'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setRetryPolicy(p)}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${retryPolicy === p
                                                ? 'bg-[#2ECFFF] text-[#0B1C2D]'
                                                : 'bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-white'
                                                }`}
                                        >
                                            {p === 'none' ? 'No retry' : p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        onUpdate(apiKey.id, webhookUrl, retryPolicy);
                                        setEditingKey(null);
                                    }}
                                    className="bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold text-sm"
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditingKey(null)}
                                    className="text-[#6B8BA4]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#6B8BA4]" />
                                <span className="text-sm text-[#8FAEC6] font-mono">
                                    {apiKey.webhookUrl || 'Not configured'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#6B8BA4]" />
                                <span className="text-sm text-[#6B8BA4]">
                                    Secret: {apiKey.webhookSecret || '—'}
                                </span>
                            </div>
                            {apiKey.webhookLastDelivery && (
                                <div className="flex items-center gap-2">
                                    {apiKey.webhookLastDelivery.status === 'success' ? (
                                        <Check className="w-4 h-4 text-[#2DFF9A]" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className={`text-sm ${apiKey.webhookLastDelivery.status === 'success' ? 'text-[#2DFF9A]' : 'text-red-400'}`}>
                                        Last delivery: {apiKey.webhookLastDelivery.status}
                                        {apiKey.webhookLastDelivery.timestamp && ` — ${new Date(apiKey.webhookLastDelivery.timestamp).toLocaleString()}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            ))}
        </motion.div>
    );
}

function SecurityTab({ keys, onUpdate }: {
    keys: ApiKeyData[];
    onUpdate: (id: string, field: string, value: any) => void;
}) {
    const activeKeys = keys.filter((k) => k.status !== 'revoked');

    return (
        <motion.div
            key="security-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Security & Compliance</h3>
                <p className="text-[#6B8BA4] text-sm">
                    Control data retention, video storage, and verification sensitivity per API key.
                </p>
            </div>

            {activeKeys.map((apiKey) => (
                <Card key={apiKey.id} className="bg-[#050E18] border border-[#2ECFFF]/20 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-[#2ECFFF]" />
                        <h4 className="text-white font-semibold">{apiKey.name}</h4>
                        <span className="text-[#6B8BA4] text-xs font-mono">{apiKey.keyId}</span>
                    </div>

                    <div className="space-y-6">
                        {/* Data Retention */}
                        <div>
                            <label className="text-[#8FAEC6] text-xs uppercase tracking-wider block mb-3">Data Retention</label>
                            <div className="flex gap-2">
                                {[
                                    { value: '24h', label: '24 Hours' },
                                    { value: '7d', label: '7 Days' },
                                    { value: '30d', label: '30 Days' },
                                    { value: 'none', label: 'No Retention' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => onUpdate(apiKey.id, 'dataRetention', opt.value)}
                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${apiKey.dataRetention === opt.value
                                            ? 'bg-[#2ECFFF] text-[#0B1C2D]'
                                            : 'bg-white/5 border border-white/10 text-[#8FAEC6] hover:text-white'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggle: Disable Video Storage */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-medium">Disable Video Storage</p>
                                <p className="text-[#6B8BA4] text-xs">Only store metadata, not raw video captures.</p>
                            </div>
                            <button
                                onClick={() => onUpdate(apiKey.id, 'disableVideoStorage', !apiKey.disableVideoStorage)}
                                className={`w-12 h-6 rounded-full transition-all relative ${apiKey.disableVideoStorage ? 'bg-[#2ECFFF]' : 'bg-gray-700'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${apiKey.disableVideoStorage ? 'left-6' : 'left-0.5'
                                    }`} />
                            </button>
                        </div>

                        {/* Toggle: Extra Verification */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-medium">Extra Verification for Low Scores</p>
                                <p className="text-[#6B8BA4] text-xs">Require additional checks when confidence is below threshold.</p>
                            </div>
                            <button
                                onClick={() => onUpdate(apiKey.id, 'requireExtraVerification', !apiKey.requireExtraVerification)}
                                className={`w-12 h-6 rounded-full transition-all relative ${apiKey.requireExtraVerification ? 'bg-[#2ECFFF]' : 'bg-gray-700'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${apiKey.requireExtraVerification ? 'left-6' : 'left-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </Card>
            ))}
        </motion.div>
    );
}
