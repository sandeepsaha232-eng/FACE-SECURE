import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Facebook, Twitter, Chrome } from 'lucide-react';
import { authService } from '../../services/authService';
import { Shield } from 'lucide-react';

export function SignupPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                username: formData.username
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020b14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2ECFFF]/5 rounded-full blur-[120px]" />
            </div>

            {/* Main Card Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl bg-[#081b2e] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-[#1e3a52]"
            >
                {/* Left Side - Branding */}
                <div className="w-full md:w-5/12 relative bg-[#051322] p-12 flex flex-col justify-center items-start overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#2ECFFF]/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-[#2ECFFF]/10 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-[#2ECFFF]/5 rounded-full" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8"
                        >
                            <Shield className="w-20 h-20 text-[#4CCFFF] drop-shadow-[0_0_15px_rgba(76,207,255,0.5)]" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-bold text-white mb-6 leading-tight"
                        >
                            Let's Get <br />
                            Started
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-[#8FAEC6] text-sm leading-relaxed max-w-xs"
                        >
                            Join our secure platform today. Experience state-of-the-art protection and seamless authentication features designed for the future.
                        </motion.p>
                    </div>
                </div>

                {/* Right Side - Form & Social */}
                <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#081b2e] flex relative">
                    {/* Close Button */}
                    <div className="absolute top-6 right-6 z-20">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/')}
                            className="text-[#8FAEC6] hover:text-white transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </motion.button>
                    </div>
                    {/* Form Section */}
                    <div className="flex-1 pr-8">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-10">Sign up</h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-xs text-[#8FAEC6] font-medium ml-1">Full Name</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#4CCFFF] py-2 px-1 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-1">
                                    <label className="text-xs text-[#8FAEC6] font-medium ml-1">Username</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#4CCFFF] py-2 px-1 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="johndoe123"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-xs text-[#8FAEC6] font-medium ml-1">Email Address</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#4CCFFF] py-2 px-1 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="text-xs text-[#8FAEC6] font-medium ml-1">Create Password</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#4CCFFF] py-2 px-1 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Repeat Password */}
                                <div className="space-y-1">
                                    <label className="text-xs text-[#8FAEC6] font-medium ml-1">Repeat password</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-transparent border-b border-gray-600 focus:border-[#4CCFFF] py-2 px-1 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                <div className="pt-4 flex items-center justify-between">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#2ECFFF] hover:bg-[#4CCFFF] text-[#0B1C2D] font-bold py-3 px-12 rounded shadow-[0_0_15px_rgba(31,182,201,0.3)] hover:shadow-[0_0_20px_rgba(76,207,255,0.5)] transition-all"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign up'}
                                    </motion.button>

                                    <div className="text-sm text-[#8FAEC6]">
                                        Already a Member? <Link to="/login" className="text-[#4CCFFF] hover:text-white transition-colors ml-1">Sign in here</Link>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Vertical Divider & Social Icons */}
                    <div className="hidden md:flex flex-col items-center justify-center pl-8 border-l border-gray-700/50">
                        <div className="text-[#6B8BA4] font-medium mb-8 text-sm tracking-widest">OR</div>

                        <div className="flex flex-col gap-6">
                            <motion.button whileHover={{ y: -3 }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0B1C2D] hover:bg-gray-200 transition-colors">
                                <Facebook className="w-5 h-5 fill-current" />
                            </motion.button>
                            <motion.button whileHover={{ y: -3 }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0B1C2D] hover:bg-gray-200 transition-colors">
                                <Twitter className="w-5 h-5 fill-current" />
                            </motion.button>
                            <motion.button whileHover={{ y: -3 }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0B1C2D] hover:bg-gray-200 transition-colors">
                                <Chrome className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
