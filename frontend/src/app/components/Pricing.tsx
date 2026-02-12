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
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-[#1FB6C9] via-[#3DD5E7] to-[#6FEAFF] bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                ? 'border-[#3DD5E7] shadow-2xl shadow-[#1FB6C9]/20 bg-gradient-to-br from-[#071C2F] to-[#0A2A44]'
                : 'border-[#1FB6C9]/20 shadow-lg hover:shadow-xl hover:border-[#3DD5E7]/40 bg-[#071C2F]'
                }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#1FB6C9] to-[#3DD5E7] text-[#071C2F] px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg shadow-[#1FB6C9]/50 font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </motion.div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>

              <button
                onClick={handlePlanClick}
                className={`w-full py-3 rounded-lg transition-all duration-300 mb-6 font-semibold ${plan.popular
                    ? 'bg-gradient-to-r from-[#1FB6C9] to-[#3DD5E7] hover:from-[#3DD5E7] hover:to-[#6FEAFF] text-[#071C2F] shadow-lg shadow-[#1FB6C9]/30 hover:shadow-xl hover:shadow-[#6FEAFF]/40'
                    : 'bg-white/10 hover:bg-[#1FB6C9]/20 text-white border border-[#3DD5E7]/30'
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
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-gradient-to-br from-[#1FB6C9] to-[#3DD5E7]' : 'bg-[#1FB6C9]'
                      }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
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
          className="text-center mt-12 text-gray-400"
        >
          <p>All plans include 99.9% uptime SLA and GDPR compliance</p>
        </motion.div>
      </div>
    </section>
  );
}
