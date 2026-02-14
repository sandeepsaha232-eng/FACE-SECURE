import { motion } from 'motion/react';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export function Navbar({ onGetStarted, onLogin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1C2D]/80 backdrop-blur-md border-b border-[#2ECFFF]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Shield
                  className="w-full h-full text-[#2ECFFF] drop-shadow-[0_0_8px_rgba(31,182,201,0.5)] group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-xl bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] bg-clip-text text-transparent font-semibold">
                FaceSecure
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-[#8FAEC6] hover:text-[#2ECFFF] transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            <button
              onClick={onLogin}
              className="text-[#8FAEC6] hover:text-[#2ECFFF] transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D] px-6 py-2 rounded-lg transition-all duration-300 shadow-md shadow-[#2ECFFF]/20 hover:shadow-lg hover:shadow-[#5ED8F5]/30 font-semibold"
            >
              Get Started
            </button>
          </motion.div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-[#8FAEC6]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block text-[#8FAEC6] hover:text-[#2ECFFF] transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-[#2ECFFF]/20 space-y-2">
              <button
                onClick={() => {
                  onLogin?.();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-[#8FAEC6] hover:text-[#2ECFFF] transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onGetStarted();
                  setIsOpen(false);
                }}
                className="block w-full bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D] px-6 py-2 rounded-lg transition-all duration-300 font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
