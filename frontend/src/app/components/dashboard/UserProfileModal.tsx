import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, MapPin, Calendar, Globe, Bell, Shield, Moon, Sun, Monitor, Camera, Lock, Mail, Save, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { authService, UserProfile } from '../../services/authService';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabId = 'profile' | 'personal' | 'settings';

const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'personal', label: 'Personal Info', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Monitor },
];

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await authService.getProfile();
            if (response.success) {
                setProfile(response.data);
                setFormData(response.data);
            }
        } catch (error) {
            toast.error('Failed to load profile');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await authService.updateProfile(formData);
            if (response.success) {
                setProfile(response.data);
                // Sync updated user data to localStorage so dashboard header reflects changes
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        const updated = { ...parsed, name: response.data.name, profilePhoto: response.data.profilePhoto };
                        localStorage.setItem('user', JSON.stringify(updated));
                    } catch { }
                }
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                // @ts-ignore
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSDeepNestedChange = (root: string, parent: string, field: string, value: any) => {
        setFormData(prev => {
            // @ts-ignore
            const rootObj = prev[root] || {};
            const parentObj = rootObj[parent] || {};

            return {
                ...prev,
                [root]: {
                    ...rootObj,
                    [parent]: {
                        ...parentObj,
                        [field]: value
                    }
                }
            };
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className="bg-[#0B1C2D] border border-[#2ECFFF]/30 w-full md:max-w-4xl h-full md:h-[85vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-[#2ECFFF]/20 flex items-center justify-between bg-[#050E18]/50">
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-16 h-16 rounded-full bg-[#2ECFFF]/20 border-2 border-[#2ECFFF]/40 flex items-center justify-center overflow-hidden">
                                            {formData.profilePhoto ? (
                                                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-[#2ECFFF]" />
                                            )}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#2ECFFF] text-[#0B1C2D] hover:bg-[#2ECFFF] transition-colors shadow-lg">
                                            <Camera className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{profile?.name || 'Loading...'}</h2>
                                        <p className="text-[#8FAEC6] text-sm">User ID: <span className="font-mono text-[#2ECFFF]">{profile?._id}</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-[#8FAEC6] hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-full md:w-64 bg-[#050E18]/30 border-b md:border-b-0 md:border-r border-[#2ECFFF]/20 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0">
                                    <div className="flex md:flex-col gap-2 flex-1 min-w-max">
                                        {TABS.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                                    ? 'bg-[#2ECFFF]/10 text-[#2ECFFF] border border-[#2ECFFF]/30'
                                                    : 'text-[#8FAEC6] hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <tab.icon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        ))}

                                        {/* Mobile Logout Button */}
                                        <button
                                            onClick={() => {
                                                authService.logout();
                                            }}
                                            className="md:hidden flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all whitespace-nowrap border border-red-500/20"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </div>

                                    {/* Logout - Hidden on mobile, shown in settings or bottom */}
                                    <div className="hidden md:block pt-4 mt-4 border-t border-[#2ECFFF]/10">
                                        <button
                                            onClick={() => {
                                                authService.logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>

                                {/* Main Panel */}
                                <div className="flex-1 overflow-y-auto p-8 relative">
                                    {loading ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECFFF]" />
                                        </div>
                                    ) : (
                                        <div className="max-w-2xl space-y-8">
                                            {activeTab === 'profile' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <InputField
                                                            label="Full Name"
                                                            value={formData.name || ''}
                                                            onChange={(v) => handleChange('name', v)}
                                                            icon={User}
                                                        />
                                                        <InputField
                                                            label="Username"
                                                            value={formData.username || ''}
                                                            onChange={(v) => handleChange('username', v)}
                                                            placeholder="@username"
                                                            icon={Globe}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Bio</label>
                                                        <textarea
                                                            value={formData.bio || ''}
                                                            onChange={(e) => handleChange('bio', e.target.value)}
                                                            className="w-full h-32 bg-[#0B1C2D] border border-[#2ECFFF]/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#2ECFFF] focus:outline-none resize-none transition-colors"
                                                            placeholder="Tell us a little about yourself..."
                                                            maxLength={500}
                                                        />
                                                        <div className="text-right text-xs text-[#6B8BA4] mt-1">
                                                            {(formData.bio || '').length}/500
                                                        </div>
                                                    </div>
                                                    <InputField
                                                        label="Profile Photo URL"
                                                        value={formData.profilePhoto || ''}
                                                        onChange={(v) => handleChange('profilePhoto', v)}
                                                        placeholder="https://..."
                                                        icon={Camera}
                                                    />
                                                </div>
                                            )}

                                            {activeTab === 'personal' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <InputField
                                                            label="Email Address"
                                                            value={formData.email || ''}
                                                            disabled
                                                            icon={Mail}
                                                        />
                                                        <InputField
                                                            label="Phone Number"
                                                            value={formData.phoneNumber || ''}
                                                            onChange={(v) => handleChange('phoneNumber', v)}
                                                            placeholder="+1 (555) 000-0000"
                                                            icon={Phone}
                                                        />
                                                        <InputField
                                                            label="Date of Birth"
                                                            type="date"
                                                            value={(() => {
                                                                if (!formData.dateOfBirth) return '';
                                                                try {
                                                                    const date = new Date(formData.dateOfBirth);
                                                                    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                                                                } catch (e) {
                                                                    return '';
                                                                }
                                                            })()}
                                                            onChange={(v) => handleChange('dateOfBirth', v)}
                                                            icon={Calendar}
                                                        />
                                                        <div>
                                                            <label className="block text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">Gender</label>
                                                            <select
                                                                value={formData.gender || ''}
                                                                onChange={(e) => handleChange('gender', e.target.value)}
                                                                className="w-full bg-[#0B1C2D] border border-[#2ECFFF]/30 rounded-lg px-4 py-3 text-white focus:border-[#2ECFFF] focus:outline-none appearance-none"
                                                            >
                                                                <option value="">Prefer not to say</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <InputField
                                                        label="Location"
                                                        value={formData.location || ''}
                                                        onChange={(v) => handleChange('location', v)}
                                                        placeholder="City, Country"
                                                        icon={MapPin}
                                                    />
                                                </div>
                                            )}

                                            {activeTab === 'settings' && (
                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                            <Monitor className="w-5 h-5 text-[#2ECFFF]" />
                                                            Appearance
                                                        </h3>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {['light', 'dark', 'system'].map((theme) => (
                                                                <button
                                                                    key={theme}
                                                                    onClick={() => handleNestedChange('preferences', 'theme', theme)}
                                                                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${formData.preferences?.theme === theme
                                                                        ? 'bg-[#2ECFFF]/10 border-[#2ECFFF] text-[#2ECFFF]'
                                                                        : 'bg-[#0B1C2D] border-[#2ECFFF]/30 text-[#8FAEC6] hover:border-[#2ECFFF]/60'
                                                                        }`}
                                                                >
                                                                    {theme === 'light' && <Sun className="w-6 h-6" />}
                                                                    {theme === 'dark' && <Moon className="w-6 h-6" />}
                                                                    {theme === 'system' && <Monitor className="w-6 h-6" />}
                                                                    <span className="capitalize text-sm font-medium">{theme}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                            <Bell className="w-5 h-5 text-[#2ECFFF]" />
                                                            Notifications
                                                        </h3>
                                                        <div className="space-y-3">
                                                            <Toggle
                                                                label="Email Notifications"
                                                                description="Receive security alerts and updates via email"
                                                                checked={formData.preferences?.notifications?.email ?? true}
                                                                onChange={(c) => handleSDeepNestedChange('preferences', 'notifications', 'email', c)}
                                                            />
                                                            <Toggle
                                                                label="Push Notifications"
                                                                description="Receive notifications on your device"
                                                                checked={formData.preferences?.notifications?.push ?? true}
                                                                onChange={(c) => handleSDeepNestedChange('preferences', 'notifications', 'push', c)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                            <Shield className="w-5 h-5 text-[#2ECFFF]" />
                                                            Privacy
                                                        </h3>
                                                        <Toggle
                                                            label="Public Profile"
                                                            description="Allow others to see your profile information"
                                                            checked={formData.preferences?.privacy?.profilePublic ?? false}
                                                            onChange={(c) => handleSDeepNestedChange('preferences', 'privacy', 'profilePublic', c)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[#2ECFFF]/20 bg-[#050E18]/50 flex justify-between items-center">
                                <div className="text-xs text-[#6B8BA4]">
                                    Last user update: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Never'}
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" onClick={onClose} className="text-[#8FAEC6] hover:text-white">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold min-w-[100px]"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function InputField({ label, value, onChange, type = "text", placeholder, disabled, icon: Icon }: any) {
    return (
        <div>
            <label className="block text-[#8FAEC6] text-xs uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8BA4]">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-[#0B1C2D] border border-[#2ECFFF]/30 rounded-lg py-3 text-white placeholder-gray-600 focus:border-[#2ECFFF] focus:outline-none transition-colors ${Icon ? 'pl-10 pr-4' : 'px-4'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B1C2D] border border-[#2ECFFF]/20">
            <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-xs text-[#6B8BA4]">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-[#2ECFFF]' : 'bg-gray-700'
                    }`}
            >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${checked ? 'left-6' : 'left-0.5'
                    }`} />
            </button>
        </div>
    );
}
