import { motion } from 'motion/react';
import { ArrowRight, Shield } from 'lucide-react';

interface CTAProps {
  onGetStarted: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#071C2F] via-[#0A2A44] to-[#071C2F] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#1FB6C9] rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3DD5E7] rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#3DD5E7]/30 rounded-full px-4 py-2 mb-6"
        >
          <Shield className="w-4 h-4 text-[#3DD5E7]" />
          <span className="text-sm">14-Day Free Trial • No Credit Card Required</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl mb-6"
        >
          Ready to Secure Your Platform?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Join thousands of companies using our advanced face recognition technology. 
          Start your free trial today and experience the future of authentication.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#1FB6C9] to-[#3DD5E7] hover:from-[#3DD5E7] hover:to-[#6FEAFF] text-[#071C2F] px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#1FB6C9]/20 hover:shadow-xl hover:shadow-[#6FEAFF]/30 hover:scale-105 flex items-center justify-center gap-2 group font-semibold"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white/10 backdrop-blur-sm border border-[#3DD5E7]/30 hover:bg-[#1FB6C9]/20 hover:border-[#6FEAFF]/50 text-white px-8 py-4 rounded-lg transition-all duration-300">
            Schedule Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-sm text-gray-400"
        >
          Trusted by 150+ enterprises worldwide • GDPR & SOC 2 Compliant
        </motion.div>
      </div>
    </section>
  );
}
