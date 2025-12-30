import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MessageSquare,
  FileText,
  ShoppingBag,
  Truck,
  KeyRound,
  LifeBuoy,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  previewUrl: string;
  category: "customer" | "order" | "account" | "support";
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "proof-confirmation",
    name: "Proof Confirmation",
    description: "Sent when admin creates a proof for customer approval",
    icon: <FileText className="w-6 h-6" />,
    previewUrl: "/api/email-preview/proof",
    category: "order",
  },
  {
    id: "signup-confirmation",
    name: "Signup Confirmation",
    description: "Welcome email sent to new customers upon registration",
    icon: <MessageSquare className="w-6 h-6" />,
    previewUrl: "/api/email-preview/signup",
    category: "account",
  },
  {
    id: "order-confirmation",
    name: "Order Confirmation",
    description: "Sent immediately after customer places an order",
    icon: <ShoppingBag className="w-6 h-6" />,
    previewUrl: "/api/email-preview/order-confirmation",
    category: "order",
  },
  {
    id: "shipping-confirmation",
    name: "Shipping Confirmation",
    description: "Sent when order is shipped with tracking information",
    icon: <Truck className="w-6 h-6" />,
    previewUrl: "/api/email-preview/shipping",
    category: "order",
  },
  {
    id: "password-reset",
    name: "Password Reset",
    description: "Sent when customer requests to reset their password",
    icon: <KeyRound className="w-6 h-6" />,
    previewUrl: "/api/email-preview/password-reset",
    category: "account",
  },
  {
    id: "support-reply",
    name: "Support Ticket Reply",
    description: "Notification when support team responds to customer inquiry",
    icon: <LifeBuoy className="w-6 h-6" />,
    previewUrl: "/api/email-preview/support-reply",
    category: "support",
  },
];

export default function AdminEmailNotifications() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Check authentication on mount
  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const handlePreview = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsLoading(true);
    setPreviewUrl(template.previewUrl);
    setIsLoading(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(`${Date.now()}`);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates =
    filterCategory === "all"
      ? EMAIL_TEMPLATES
      : EMAIL_TEMPLATES.filter((t) => t.category === filterCategory);

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "account", label: "Account" },
    { value: "order", label: "Orders" },
    { value: "support", label: "Support" },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Mail className="w-8 h-8 text-blue-600" />
                  Email Notifications
                </h1>
                <p className="mt-2 text-gray-600">
                  View and manage email templates sent to your customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminNavigationGrid />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
                </div>

                {/* Category Filter */}
                <div className="p-4 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template List */}
                <div className="divide-y divide-gray-200">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handlePreview(template)}
                      className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${
                        selectedTemplate?.id === template.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 p-2 rounded-lg ${
                            selectedTemplate?.id === template.id
                              ? "text-blue-600 bg-blue-100"
                              : "text-gray-600 bg-gray-100"
                          }`}
                        >
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[600px]">
                  {/* Preview Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {selectedTemplate.name} Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCopyUrl(selectedTemplate.previewUrl)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </>
                        )}
                      </Button>
                      <a
                        href={selectedTemplate.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Open Full
                      </a>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="flex-1 overflow-auto bg-gray-50">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading preview...</div>
                      </div>
                    ) : previewUrl ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Email Preview"
                      />
                    ) : null}
                  </div>

                  {/* Preview Footer */}
                  <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-500">
                      This is a preview of the email template. To edit this template or send test emails,
                      contact the development team.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center h-[600px] flex items-center justify-center">
                  <div>
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an email template from the list to see preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Information */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Email Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Emails</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Signup confirmation for new accounts</li>
                  <li>• Order confirmation after purchase</li>
                  <li>• Shipping & tracking information</li>
                  <li>• Password reset requests</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Proof approval requests</li>
                  <li>• Design revision notifications</li>
                  <li>• Order status updates</li>
                  <li>• Support ticket responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
