import { User, Mail, Phone, Building } from "lucide-react";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
}

interface ProfileCardProps {
  customer: Customer | null;
}

export default function ProfileCard({ customer }: ProfileCardProps) {
  if (!customer) return null;

  return (
    <div className="bg-white/5 border border-blue-300/20 rounded-2xl p-8 h-fit hover:border-blue-300/40 transition-colors">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <User className="w-6 h-6 text-blue-300" />
        </div>
        Account Profile
      </h2>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <p className="text-blue-200/70 text-sm font-medium mb-2">Full Name</p>
          <p className="text-xl font-semibold text-white">
            {customer.firstName} {customer.lastName}
          </p>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 text-blue-200/70 text-sm font-medium mb-2">
            <Mail className="w-4 h-4" />
            Email Address
          </div>
          <p className="text-white break-all">{customer.email}</p>
        </div>

        {/* Phone */}
        {customer.phone && (
          <div>
            <div className="flex items-center gap-2 text-blue-200/70 text-sm font-medium mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </div>
            <p className="text-white">{customer.phone}</p>
          </div>
        )}

        {/* Company */}
        {customer.companyName && (
          <div>
            <div className="flex items-center gap-2 text-blue-200/70 text-sm font-medium mb-2">
              <Building className="w-4 h-4" />
              Company
            </div>
            <p className="text-white">{customer.companyName}</p>
          </div>
        )}

        {/* Customer ID */}
        <div className="pt-4 border-t border-blue-300/20">
          <p className="text-blue-200/50 text-xs font-medium mb-1">Customer ID</p>
          <p className="text-white/70 text-sm font-mono">{customer.id}</p>
        </div>
      </div>
    </div>
  );
}
