import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Eye,
  DollarSign,
  Package,
  Mail,
  ImageIcon,
  BookOpen,
  FileText,
  Truck,
  MessageSquare,
  Star,
  Percent,
  Receipt,
} from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const quickAccessLinks = [
  {
    title: "Orders",
    description: "View all orders",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/orders",
    color: "bg-blue-100 hover:bg-blue-200",
    textColor: "text-blue-600",
  },
  {
    title: "Proofs",
    description: "Manage proofs",
    icon: <Eye className="w-5 h-5" />,
    path: "/admin/proofs",
    color: "bg-orange-100 hover:bg-orange-200",
    textColor: "text-orange-600",
  },
  {
    title: "Products",
    description: "Manage catalog",
    icon: <Package className="w-5 h-5" />,
    path: "/admin/products",
    color: "bg-pink-100 hover:bg-pink-200",
    textColor: "text-pink-600",
  },
  {
    title: "Customers",
    description: "View customers",
    icon: <Users className="w-5 h-5" />,
    path: "/admin/customers",
    color: "bg-purple-100 hover:bg-purple-200",
    textColor: "text-purple-600",
  },
  {
    title: "Finance",
    description: "View spending",
    icon: <DollarSign className="w-5 h-5" />,
    path: "/admin/finance",
    color: "bg-green-100 hover:bg-green-200",
    textColor: "text-green-600",
  },
  {
    title: "Invoices",
    description: "Manage invoices",
    icon: <Receipt className="w-5 h-5" />,
    path: "/admin/invoices",
    color: "bg-violet-100 hover:bg-violet-200",
    textColor: "text-violet-600",
  },
  {
    title: "Analytics",
    description: "View analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    path: "/admin/analytics",
    color: "bg-cyan-100 hover:bg-cyan-200",
    textColor: "text-cyan-600",
  },
  {
    title: "Blogs",
    description: "Manage blogs",
    icon: <BookOpen className="w-5 h-5" />,
    path: "/admin/blogs",
    color: "bg-indigo-100 hover:bg-indigo-200",
    textColor: "text-indigo-600",
  },
  {
    title: "Legal Pages",
    description: "Manage legal content",
    icon: <FileText className="w-5 h-5" />,
    path: "/admin/legal-pages",
    color: "bg-amber-100 hover:bg-amber-200",
    textColor: "text-amber-600",
  },
  {
    title: "Shipping",
    description: "Manage shipping options",
    icon: <Truck className="w-5 h-5" />,
    path: "/admin/shipping",
    color: "bg-teal-100 hover:bg-teal-200",
    textColor: "text-teal-600",
  },
  {
    title: "Support",
    description: "Answer support tickets",
    icon: <MessageSquare className="w-5 h-5" />,
    path: "/admin/support",
    color: "bg-red-100 hover:bg-red-200",
    textColor: "text-red-600",
  },
  {
    title: "Reviews",
    description: "Moderate customer reviews",
    icon: <Star className="w-5 h-5" />,
    path: "/admin/reviews",
    color: "bg-yellow-100 hover:bg-yellow-200",
    textColor: "text-yellow-600",
  },
  {
    title: "Email Templates",
    description: "View & manage email notifications",
    icon: <Mail className="w-5 h-5" />,
    path: "/admin/email-notifications",
    color: "bg-sky-100 hover:bg-sky-200",
    textColor: "text-sky-600",
  },
  {
    title: "Gallery",
    description: "Manage featured gallery",
    icon: <ImageIcon className="w-5 h-5" />,
    path: "/admin/gallery",
    color: "bg-rose-100 hover:bg-rose-200",
    textColor: "text-rose-600",
  },
  {
    title: "Discounts",
    description: "Manage discount codes",
    icon: <Percent className="w-5 h-5" />,
    path: "/admin/discounts",
    color: "bg-emerald-100 hover:bg-emerald-200",
    textColor: "text-emerald-600",
  },
];

export default function AdminQuickAccess() {
  const navigate = useNavigate();
  const { notifications } = useAdminNotifications();

  const getNotificationBadge = (title: string) => {
    if (title === "Support" && notifications.openTickets > 0) {
      return notifications.openTickets;
    }
    if (title === "Orders" && notifications.pendingOrders > 0) {
      return notifications.pendingOrders;
    }
    if (title === "Proofs" && notifications.rejectedProofs > 0) {
      return notifications.rejectedProofs;
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {quickAccessLinks.map((link) => {
          const badge = getNotificationBadge(link.title);
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 ${link.color}`}
            >
              <div className={`${link.textColor}`}>{link.icon}</div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                  {link.title}
                </p>
              </div>
              {badge !== null && (
                <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {badge > 99 ? "99+" : badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
