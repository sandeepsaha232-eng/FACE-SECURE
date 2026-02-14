import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams and startups',
    features: [
      'Up to 1,000 verifications/month',
      'Basic face recognition',
      'Liveness detection',
      'Email support',
      'Cloud deployment',
      'API access'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing businesses with higher demands',
    features: [
      'Up to 10,000 verifications/month',
      'Advanced multi-step verification',
      'Liveness detection',
      'Priority support 24/7',
      'Cloud & On-premise',
      'API access',
      'Custom integrations',
      'Real-time analytics'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited verifications',
      'Full feature suite',
      'Dedicated account manager',
      'Custom model training',
      'On-premise deployment',
      'White-label solution',
      'SLA guarantee',
      'Advanced analytics & reporting'
    ],
    popular: false
  }
];

export function Pricing() {
  const navigate = useNavigate();

  const handlePlanClick = () => {
    alert("Please login to subscribe to a plan.");
    navigate('/login');
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#050E18]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-[#1A8FCC] via-[#2ECFFF] to-[#5ED8F5] bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-[#8FAEC6] max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${plan.popular
                ? 'border-[#2ECFFF] shadow-2xl shadow-[#2ECFFF]/20 bg-gradient-to-br from-[#0B1C2D] to-[#050E18]'
                : 'border-[#2ECFFF]/20 shadow-lg hover:shadow-xl hover:border-[#2ECFFF]/40 bg-[#0B1C2D]'
                }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] text-[#0B1C2D] px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg shadow-[#2ECFFF]/50 font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </motion.div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl text-white">{plan.price}</span>
                  <span className="text-[#8FAEC6]">{plan.period}</span>
                </div>
                <p className="text-[#8FAEC6] mt-2">{plan.description}</p>
              </div>

              <button
                onClick={handlePlanClick}
                className={`w-full py-3 rounded-lg transition-all duration-300 mb-6 font-semibold ${plan.popular
                    ? 'bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D] shadow-lg shadow-[#2ECFFF]/30 hover:shadow-xl hover:shadow-[#5ED8F5]/40'
                    : 'bg-white/10 hover:bg-[#2ECFFF]/20 text-white border border-[#2ECFFF]/30'
                  }`}
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
              </button>


              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-gradient-to-br from-[#2ECFFF] to-[#5ED8F5]' : 'bg-[#2ECFFF]'
                      }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[#8FAEC6]">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-[#8FAEC6]"
        >
          <p>All plans include 99.9% uptime SLA and GDPR compliance</p>
        </motion.div>
      </div>
    </section>
  );
}
