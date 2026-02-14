import { motion } from 'motion/react';
import { Shield, CheckCircle, Zap } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1C2D] via-[#050E18] to-[#0B1C2D]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#2ECFFF] rounded-full mix-blend-screen filter blur-xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-[#2ECFFF] rounded-full mix-blend-screen filter blur-xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/2 w-72 h-72 bg-[#5ED8F5] rounded-full mix-blend-screen filter blur-xl opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Advanced AI Technology</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
            >
              Secure Your World with{' '}
              <span className="bg-gradient-to-r from-[#1A8FCC] via-[#2ECFFF] to-[#5ED8F5] bg-clip-text text-transparent">
                Face Recognition
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-[#8FAEC6] mb-8 leading-relaxed"
            >
              Experience the next generation of security with our advanced multi-step face recognition system. 
              Powered by AI, designed for your peace of mind.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D] px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-[#2ECFFF]/20 hover:shadow-xl hover:shadow-[#5ED8F5]/30 hover:scale-105 font-semibold"
              >
                Get Started Free
              </button>
              <button className="bg-white/10 backdrop-blur-sm border border-[#2ECFFF]/30 hover:bg-[#2ECFFF]/20 hover:border-[#5ED8F5]/50 text-white px-8 py-4 rounded-lg transition-all duration-300">
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Shield, text: 'Bank-Level Security' },
                { icon: CheckCircle, text: '99.9% Accuracy' },
                { icon: Zap, text: 'Instant Verification' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-[#2ECFFF]" />
                  <span className="text-sm text-[#8FAEC6]">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - Visual representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[600px]">
              {/* Main face recognition frame */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotateY: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative w-80 h-80 bg-gradient-to-br from-[#2ECFFF]/10 to-[#2ECFFF]/10 backdrop-blur-lg border-2 border-[#2ECFFF]/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#2ECFFF]/10">
                  {/* Scanning lines effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-[#5ED8F5]/20 to-transparent"
                    animate={{
                      y: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Face outline */}
                  <div className="relative w-64 h-64 border-4 border-dashed border-[#2ECFFF]/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#2ECFFF]/20 to-[#2ECFFF]/20 rounded-full" />
                    
                    {/* Corner brackets */}
                    {[0, 90, 180, 270].map((rotation, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-12 h-12 border-t-4 border-l-4 border-[#5ED8F5]"
                        style={{
                          top: '10%',
                          left: '10%',
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: 'center'
                        }}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>

                  {/* Verification checkmark */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 1,
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute -top-4 -right-4 bg-gradient-to-br from-[#2ECFFF] to-[#5ED8F5] rounded-full p-3 shadow-lg shadow-[#5ED8F5]/50"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-10 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 shadow-lg"
              >
                <div className="text-white text-sm">Multi-Layer Security</div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-20 left-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 shadow-lg"
              >
                <div className="text-white text-sm">AI-Powered</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}