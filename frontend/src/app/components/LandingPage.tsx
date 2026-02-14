import { useNavigate } from 'react-router-dom';
import { IntroAnimation } from './IntroAnimation';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Stats } from './Stats';
import { Pricing } from './Pricing';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { Footer } from './Footer';
import { useState } from 'react';

export function LandingPage() {
    const navigate = useNavigate();
    const [introComplete, setIntroComplete] = useState(false);

    const handleGetStarted = () => {
        navigate('/signup');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    // Show intro animation first
    if (!introComplete) {
        return <IntroAnimation onComplete={() => setIntroComplete(true)} />;
    }

    return (
        <div className="min-h-screen bg-[#0B1C2D]">
            <Navbar onGetStarted={handleGetStarted} onLogin={handleLogin} />

            <main>
                <Hero onGetStarted={handleGetStarted} />

                <div id="features">
                    <Features />
                </div>

                <div id="how-it-works">
                    <HowItWorks />
                </div>

                <Stats />

                <div id="pricing">
                    <Pricing />
                </div>

                <div id="testimonials">
                    <Testimonials />
                </div>

                <CTA onGetStarted={handleGetStarted} />
            </main>

            <Footer />
            <div className="fixed bottom-0 right-0 bg-black/50 text-white text-[10px] p-1 z-50">
                v1.0.1-prod-fix
            </div>
        </div>
    );
}
