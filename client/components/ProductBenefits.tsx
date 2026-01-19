import { CheckCircle, Clock, Package } from "lucide-react";

export default function ProductBenefits() {
  const benefits = [
    {
      icon: CheckCircle,
      color: "text-green-600",
      title: "Free Online Proof",
      description: "Review your design before production",
    },
    {
      icon: Clock,
      color: "text-orange-600",
      title: "Printed in 24-48 hours",
      description: "Fast turnaround on all orders",
    },
    {
      icon: Package,
      color: "text-blue-600",
      title: "Free Shipping, always.",
      description: "No hidden fees or charges",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`w-5 h-5 ${benefit.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
