import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO, TechCorp',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    content: 'The multi-step verification has completely transformed our security infrastructure. Implementation was seamless and our users love how fast it is.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Security Director, FinanceHub',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    content: 'Best face recognition solution we\'ve tried. The accuracy is incredible and the liveness detection gives us confidence against fraud attempts.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager, StartupXYZ',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    content: 'Easy to integrate, reliable, and the support team is fantastic. Our authentication rate improved by 40% after switching to this platform.',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#071C2F] via-[#0A2A44] to-[#071C2F]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-[#1FB6C9] via-[#3DD5E7] to-[#6FEAFF] bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what our customers have to say about their experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-[#1FB6C9]/10 transition-all duration-300 border border-[#3DD5E7]/20 hover:border-[#6FEAFF]/30"
            >
              <Quote className="w-10 h-10 text-[#1FB6C9]/40 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#3DD5E7] text-[#3DD5E7]" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#3DD5E7]/30"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
