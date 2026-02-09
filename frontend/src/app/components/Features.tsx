import { motion } from 'motion/react';
import { Shield, Zap, Lock, Eye, Smartphone, Cloud, Users, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Multi-Step Verification',
    description: 'Advanced layered security with multiple verification steps to ensure maximum protection against unauthorized access.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Recognition and verification in under 0.5 seconds. Experience seamless security without the wait.'
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'Your biometric data is encrypted at every step, from capture to storage, ensuring complete privacy.'
  },
  {
    icon: Eye,
    title: 'Liveness Detection',
    description: 'Advanced AI detects real faces vs photos or videos, preventing spoofing and deepfake attacks.'
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Works seamlessly across all devices - mobile, tablet, desktop, and embedded systems.'
  },
  {
    icon: Cloud,
    title: 'Cloud & On-Premise',
    description: 'Deploy on cloud infrastructure or keep everything on-premise. You control where your data lives.'
  },
  {
    icon: Users,
    title: 'Scalable',
    description: 'From small teams to enterprise organizations. Our system scales effortlessly with your needs.'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboard with insights on authentication attempts, success rates, and security alerts.'
  }
];

export function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A2A44]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-[#1FB6C9] via-[#3DD5E7] to-[#6FEAFF] bg-clip-text text-transparent">
              Complete Security
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to implement world-class face recognition security in your application
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-[#071C2F] to-[#0A2A44] rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-[#1FB6C9]/20 transition-all duration-300 border border-[#1FB6C9]/20"
            >
              <div className="bg-gradient-to-br from-[#1FB6C9] to-[#3DD5E7] w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-[#1FB6C9]/30">
                <feature.icon className="w-6 h-6 text-[#071C2F]" />
              </div>
              <h3 className="text-xl mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}