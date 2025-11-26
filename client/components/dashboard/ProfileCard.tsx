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
    <div className="bg-white border border-gray-200 rounded-2xl p-8 h-fit hover:shadow-md transition-shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        Account Profile
      </h2>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">Full Name</p>
          <p className="text-xl font-semibold text-gray-900">
            {customer.firstName} {customer.lastName}
          </p>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-2">
            <Mail className="w-4 h-4" />
            Email Address
          </div>
          <p className="text-gray-900 break-all">{customer.email}</p>
        </div>

        {/* Phone */}
        {customer.phone && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </div>
            <p className="text-gray-900">{customer.phone}</p>
          </div>
        )}

        {/* Company */}
        {customer.companyName && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-2">
              <Building className="w-4 h-4" />
              Company
            </div>
            <p className="text-gray-900">{customer.companyName}</p>
          </div>
        )}

        {/* Customer ID */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-xs font-medium mb-1">Customer ID</p>
          <p className="text-gray-700 text-sm font-mono">{customer.id}</p>
        </div>
      </div>
    </div>
  );
}
