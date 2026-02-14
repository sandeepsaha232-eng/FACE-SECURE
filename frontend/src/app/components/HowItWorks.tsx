import { motion } from 'motion/react';
import { Camera, ScanFace, ShieldCheck, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    step: 'Step 1',
    title: 'Face Capture',
    description: 'Our AI-powered camera captures high-resolution facial features in real-time, working in various lighting conditions.'
  },
  {
    icon: ScanFace,
    step: 'Step 2',
    title: 'Liveness Check',
    description: 'Advanced algorithms verify that the subject is a real person, not a photo or video, preventing spoofing attacks.'
  },
  {
    icon: ShieldCheck,
    step: 'Step 3',
    title: 'Multi-Layer Verification',
    description: 'Your facial data goes through multiple verification layers, comparing against encrypted templates with 99.9% accuracy.'
  },
  {
    icon: CheckCircle2,
    step: 'Step 4',
    title: 'Instant Authorization',
    description: 'Once verified, access is granted instantly. All processes complete in under 500ms for seamless user experience.'
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0B1C2D] via-[#050E18] to-[#0B1C2D] text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-xl text-[#8FAEC6] max-w-2xl mx-auto">
            Our multi-step verification process ensures maximum security while maintaining a seamless user experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#2ECFFF] to-transparent -z-10" />
              )}

              <div className="bg-white/5 backdrop-blur-md border border-[#2ECFFF]/20 rounded-xl p-6 hover:bg-white/10 hover:border-[#5ED8F5]/30 transition-all duration-300">
                <div className="bg-gradient-to-br from-[#2ECFFF] to-[#5ED8F5] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#2ECFFF]/30">
                  <step.icon className="w-8 h-8 text-[#0B1C2D]" />
                </div>
                
                <div className="text-sm text-[#2ECFFF] mb-2">{step.step}</div>
                <h3 className="text-2xl mb-3">{step.title}</h3>
                <p className="text-[#8FAEC6] leading-relaxed">{step.description}</p>
              </div>

              {/* Step number badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#2ECFFF] to-[#5ED8F5] rounded-full flex items-center justify-center text-[#0B1C2D] shadow-lg shadow-[#5ED8F5]/50 font-bold"
              >
                {index + 1}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Timeline visualization for mobile */}
        <div className="lg:hidden mt-12 flex justify-center">
          <div className="flex flex-col gap-4">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-1 h-12 bg-gradient-to-b from-[#2ECFFF] to-[#5ED8F5]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}