import { motion } from 'motion/react';

const stats = [
  { value: '99.9%', label: 'Recognition Accuracy' },
  { value: '<500ms', label: 'Verification Speed' },
  { value: '50M+', label: 'Verifications Daily' },
  { value: '150+', label: 'Enterprise Clients' }
];

export function Stats() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1FB6C9] to-[#3DD5E7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center text-[#071C2F]"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl mb-2 font-bold"
              >
                {stat.value}
              </motion.div>
              <div className="text-lg text-[#0A2A44]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}