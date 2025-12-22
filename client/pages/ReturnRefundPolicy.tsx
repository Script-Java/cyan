import { useState, useEffect } from "react";
import Header from "@/components/Header";

interface PolicyContent {
  guarantee_days: number;
  return_conditions: string[];
  how_to_return: string[];
  defective_items_days: number;
  refund_timeline: string;
  non_returnable_items: string[];
  contact_email: string;
}

export default function ReturnRefundPolicy() {
  const [policy, setPolicy] = useState<PolicyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const response = await fetch("/api/return-refund-policy");
      if (response.ok) {
        const data = await response.json();
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error("Error fetching policy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 min-h-screen bg-[#fafafa] text-gray-900 px-10 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </>
    );
  }

  if (!policy) {
    return (
      <>
        <Header />
        <main className="pt-24 min-h-screen bg-[#fafafa] text-gray-900 px-10 py-12">
          <div className="text-center">
            <p className="text-gray-600">Policy not found</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-[#fafafa] text-gray-900 px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Return & Refund Policy</h1>

          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                At Sticky Slap, we want you to be completely satisfied with your purchase.
                If you're not happy with your custom stickers, we offer a straightforward
                return and refund policy to ensure your peace of mind.
              </p>
            </section>

            {/* 30-Day Policy */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">{policy.guarantee_days}-Day Money-Back Guarantee</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We offer a {policy.guarantee_days}-day money-back guarantee on all orders. If you're not satisfied
                with your custom stickers for any reason, you can request a full refund within
                {policy.guarantee_days} days of your purchase.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold">
                  {policy.guarantee_days} days from the date of delivery
                </p>
              </div>
            </section>

            {/* Conditions */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Return Conditions</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-600">Stickers must be unused and in original condition</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-600">Original packaging must be intact</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-600">Proof of purchase (order number) is required</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-600">Return shipping is the customer's responsibility</span>
                </li>
              </ul>
            </section>

            {/* Return Process */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">How to Request a Return</h2>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                  <span className="text-gray-600">Contact our support team at support@stickyhub.com with your order number</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                  <span className="text-gray-600">Provide a reason for your return request</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                  <span className="text-gray-600">We'll review your request and provide return shipping instructions</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                  <span className="text-gray-600">Ship the item back to us using the provided address</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</span>
                  <span className="text-gray-600">Once received and inspected, we'll process your refund (5-7 business days)</span>
                </li>
              </ol>
            </section>

            {/* Defective Items */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Defective or Damaged Items</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                If your stickers arrive damaged or defective, we'll replace them at no cost 
                to you. Simply contact us within 7 days of delivery with photos of the damage.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900 font-semibold">
                  7 days from the date of delivery
                </p>
              </div>
            </section>

            {/* Refund Timeline */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Refund Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-green-100 text-green-800 rounded-lg px-3 py-1 font-bold text-sm flex-shrink-0">5-7 days</div>
                  <div className="text-gray-600">After we receive and inspect your return</div>
                </div>
                <p className="text-gray-600 text-sm">
                  Refunds are processed to the original payment method. Depending on your bank 
                  or credit card company, it may take an additional 2-5 business days for the 
                  credit to appear in your account.
                </p>
              </div>
            </section>

            {/* Non-Returnable Items */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Items Not Eligible for Return</h2>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">×</span>
                  <span className="text-gray-600">Used, applied, or partially used stickers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">×</span>
                  <span className="text-gray-600">Items without original packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">×</span>
                  <span className="text-gray-600">Items returned after 30 days</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">×</span>
                  <span className="text-gray-600">Wholesale or bulk orders (special terms apply)</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Questions?</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                If you have any questions about our return and refund policy, please don't 
                hesitate to reach out to our customer support team.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Contact Us</p>
                <p className="text-gray-600">Email: support@stickyhub.com</p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-amber-900 text-sm">
                <span className="font-bold">Last Updated:</span> {new Date().toLocaleDateString()}
              </p>
              <p className="text-amber-900 text-sm mt-2">
                We reserve the right to update this policy at any time without notice.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
