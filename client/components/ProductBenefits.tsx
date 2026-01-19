import { CheckCircle, Clock, Package } from "lucide-react";

export default function ProductBenefits() {
  const benefits = [
    {
      icon: CheckCircle,
      color: "text-green-400",
      iconBg: "bg-green-50",
      title: "Free Online Proof",
      description: "Review your design before production",
    },
    {
      icon: Clock,
      color: "text-orange-400",
      iconBg: "bg-orange-50",
      title: "Printed in 24-48 hours",
      description: "Fast turnaround on all orders",
    },
    {
      icon: Package,
      color: "text-blue-400",
      iconBg: "bg-blue-50",
      title: "Free Shipping, always.",
      description: "No hidden fees or charges",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-8 px-4 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${benefit.iconBg}`}>
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-white">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-300">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
