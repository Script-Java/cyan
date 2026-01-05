import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Mail,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

interface SupportFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  orderId?: number;
  orderDetails?: string;
}

interface PrefillOrderData {
  orderId: number;
  orderAmount: number;
  orderDate: string;
  orderStatus: string;
  productTypes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function Support() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupportFormData>({
    name: "",
    email: "",
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });

  useEffect(() => {
    // Check for pre-filled order data
    const prefillData = localStorage.getItem("prefillOrderData");
    if (prefillData) {
      try {
        const orderData: PrefillOrderData = JSON.parse(prefillData);

        // Pre-fill the form with order information
        const orderSummary = `Order #${orderData.orderId} - ${orderData.orderDate}
Status: ${orderData.orderStatus}
Amount: $${orderData.orderAmount.toFixed(2)}
Product(s): ${orderData.productTypes || "N/A"}
Tracking: ${orderData.trackingNumber || "Pending"}
Est. Delivery: ${orderData.estimatedDelivery}

Issue: `;

        setFormData((prev) => ({
          ...prev,
          subject: `Issue with Order #${orderData.orderId}`,
          category: "order",
          orderId: orderData.orderId,
          orderDetails: `
Order ID: ${orderData.orderId}
Order Date: ${orderData.orderDate}
Order Amount: $${orderData.orderAmount.toFixed(2)}
Status: ${orderData.orderStatus}
Products: ${orderData.productTypes}
Tracking: ${orderData.trackingNumber || "Not yet available"}
Est. Delivery: ${orderData.estimatedDelivery}`,
          message: orderSummary,
        }));

        // Clear the pre-fill data from localStorage
        localStorage.removeItem("prefillOrderData");
      } catch (error) {
        console.error("Error parsing pre-filled order data:", error);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const customerId = localStorage.getItem("customerId");

      const payload = {
        ...formData,
        customerId: customerId ? parseInt(customerId) : undefined,
      };

      const response = await fetch("/api/support/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit support request");
      }

      const data = await response.json();
      toast.success(
        `Support request submitted successfully! Ticket ID: #${data.ticketId}`,
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
      });

      setTimeout(() => {
        navigate("/my-tickets");
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit support request";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header with back button */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Support Center</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Support Info Cards - Hidden on very small screens, visible on sm and up */}
            <div className="lg:col-span-1 space-y-3 sm:space-y-4 hidden sm:block">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MessageSquare className="w-5 h-5 sm:w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Live Chat
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Chat with our support team in real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="w-5 h-5 sm:w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Email Support
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Get responses within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 sm:p-4 shadow-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="w-5 h-5 sm:w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Response Time
                    </h3>
                    <p className="text-xs text-gray-700 mt-1">
                      Avg. response: 2-4 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Category and Priority Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Issue</option>
                        <option value="orders">Orders & Shipping</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="account">Account & Profile</option>
                        <option value="designs">Designs & Proofs</option>
                        <option value="technical">Technical Issue</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Details - if available */}
                  {formData.orderId && formData.orderDetails && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        📦 Order Details (Pre-filled)
                      </h3>
                      <div className="text-xs text-gray-700 space-y-1 font-mono bg-white p-3 rounded border border-blue-100">
                        {formData.orderDetails
                          .split("\n")
                          .map((line, idx) =>
                            line.trim() ? <div key={idx}>{line}</div> : null,
                          )}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        ✓ Your order information has been pre-filled. Feel free
                        to edit the message below.
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      A confirmation email will be sent to your email address
                      with a reference number. Use this number when following up
                      on your request.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Submit Support Request
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* FAQs Section */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      How long does it take to get a response?
                    </h4>
                    <p className="text-sm text-gray-600">
                      We typically respond to all inquiries within 2-4 business
                      hours. Urgent issues are prioritized for faster response.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Can I track my support request?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Yes! You'll receive a confirmation email with a reference
                      number. Use this number to check the status of your
                      request.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      What if my issue is urgent?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Select "Urgent" as the priority level and we'll get to
                      your request as soon as possible. For critical issues, you
                      can also call us.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
