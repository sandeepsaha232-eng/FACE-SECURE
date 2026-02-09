import { ReactNode } from 'react';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#071C2F] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1FB6C9]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4CCFFF]/10 rounded-full blur-[100px]" />
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-[#0A2A44]/60 backdrop-blur-xl border border-[#1FB6C9]/20 rounded-2xl shadow-2xl p-8 z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="relative">
                            <Shield className="w-10 h-10 text-[#4CCFFF] group-hover:text-[#6FEAFF] transition-colors" />
                            <Lock className="w-4 h-4 text-[#071C2F] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4CCFFF] to-[#1FB6C9]">
                            FaceSecure
                        </span>
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-[#94A3B8]">
                        {subtitle}
                    </p>
                </div>

                {/* Content */}
                {children}
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-6 text-center text-[#94A3B8] text-sm">
                <p>&copy; 2026 FaceSecure. Enterprise Grade Security.</p>
            </div>
        </div>
    );
}
