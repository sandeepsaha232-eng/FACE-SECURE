import { Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
      className={`relative bg-[#0A2A44] border-[#1FB6C9] p-6 flex flex-col h-full ${
        isPopular ? 'shadow-[0_0_30px_rgba(31,182,201,0.3)]' : ''
      }`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1FB6C9] to-[#6FEAFF] text-[#071C2F] border-none">
          Most Popular
        </Badge>
      )}
      <div className="mb-6">
        <h3 className="text-2xl text-white mb-2">{name}</h3>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl text-[#6FEAFF]">{price}</span>
          {period && <span className="text-gray-400 text-sm">{period}</span>}
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      <Button
        onClick={onSelect}
        className={`w-full mb-6 ${
          isPopular
            ? 'bg-gradient-to-r from-[#1FB6C9] to-[#3DD5E7] hover:from-[#3DD5E7] hover:to-[#6FEAFF] text-[#071C2F]'
            : 'bg-[#1FB6C9] hover:bg-[#3DD5E7] text-[#071C2F]'
        }`}
      >
        {buttonText}
      </Button>

      <div className="flex-1 space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">
              <Check className="w-4 h-4 text-[#3DD5E7]" />
            </div>
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
