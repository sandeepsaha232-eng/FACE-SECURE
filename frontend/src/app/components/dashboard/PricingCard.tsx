import { Check } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PricingCardProps {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    onSelect: () => void;
}

export function PricingCard({
    name,
    price,
    period,
    description,
    features,
    isPopular = false,
    buttonText,
    onSelect,
}: PricingCardProps) {
    return (
        <Card
            className={`relative bg-[#050E18] border-[#2ECFFF] p-6 flex flex-col h-full ${isPopular ? 'shadow-[0_0_30px_rgba(31,182,201,0.3)]' : ''
                }`}
        >
            {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] text-[#0B1C2D] border-none">
                    Most Popular
                </Badge>
            )}
            <div className="mb-6">
                <h3 className="text-2xl text-white mb-2">{name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl text-[#5ED8F5]">{price}</span>
                    {period && <span className="text-[#8FAEC6] text-sm">{period}</span>}
                </div>
                <p className="text-[#8FAEC6] text-sm">{description}</p>
            </div>

            <Button
                onClick={onSelect}
                className={`w-full mb-6 ${isPopular
                        ? 'bg-gradient-to-r from-[#2ECFFF] to-[#5ED8F5] hover:from-[#5ED8F5] hover:to-[#8AE8FF] text-[#0B1C2D]'
                        : 'bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D]'
                    }`}
            >
                {buttonText}
            </Button>

            <div className="flex-1 space-y-3">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Check className="w-4 h-4 text-[#2ECFFF]" />
                        </div>
                        <span className="text-sm text-[#8FAEC6]">{feature}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
