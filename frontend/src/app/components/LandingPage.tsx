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
        <div className="min-h-screen bg-[#071C2F]">
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
        </div>
    );
}
