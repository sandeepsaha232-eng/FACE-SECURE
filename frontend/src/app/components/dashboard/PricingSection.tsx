import { PricingCard } from './PricingCard';
import { toast } from 'sonner';

interface PricingSectionProps {
    onSelectPlan: (planName: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
    const handleSelectPlan = (planName: string) => {
        toast.success(`${planName} plan selected!`);
        onSelectPlan(planName);
    };

    const plans = [
        {
            name: 'Starter',
            price: '$49',
            period: '/month',
            description: 'Perfect for small teams and startups',
            buttonText: 'Start Free Trial',
            features: [
                'Up to 1,000 verifications/month',
                'Basic face recognition',
                'Liveness detection',
                'Email support',
                'Cloud deployment',
                'API access',
            ],
        },
        {
            name: 'Professional',
            price: '$149',
            period: '/month',
            description: 'For growing businesses with higher demands',
            buttonText: 'Start Free Trial',
            isPopular: true,
            features: [
                'Up to 10,000 verifications/month',
                'Advanced multi-step verification',
                'Liveness detection',
                'Priority support 24/7',
                'Cloud & On-premise',
                'API access',
                'Custom integrations',
                'Real-time analytics',
            ],
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large organizations with custom needs',
            buttonText: 'Contact Sales',
            features: [
                'Unlimited verifications',
                'Full feature suite',
                'Dedicated account manager',
                'Custom model training',
                'On-premise deployment',
                'White-label solution',
                'SLA guarantee',
                'Advanced analytics & reporting',
            ],
        },
    ];

    return (
        <div className="w-full">
            <div className="text-center mb-12">
                <h2 className="text-4xl text-white mb-3">Simple, Transparent Pricing</h2>
                <p className="text-[#8FAEC6] text-lg">
                    Choose the perfect plan for your needs. All plans include a 14-day free trial.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.name}
                        name={plan.name}
                        price={plan.price}
                        period={plan.period}
                        description={plan.description}
                        features={plan.features}
                        isPopular={plan.isPopular}
                        buttonText={plan.buttonText}
                        onSelect={() => handleSelectPlan(plan.name)}
                    />
                ))}
            </div>
        </div>
    );
}
