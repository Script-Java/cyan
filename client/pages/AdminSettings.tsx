import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Settings, Save } from "lucide-react";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "Stickerland",
    storeEmail: "support@stickerland.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Main Street, Anytown, ST 12345",
    timeZone: "UTC",
    currency: "USD",
    taxRate: "8.5",
    shippingCost: "5.00",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full min-h-screen bg-black flex items-center justify-center">
          <div className="text-white/60">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Store Settings</h1>
            <p className="text-white/60 mt-1">
              Configure your store details and preferences
            </p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <p className="text-green-400 text-sm font-medium">
                Settings saved successfully!
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Store Information */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-3">
                Store Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={settings.storeName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                    placeholder="Enter store name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5">
                      Store Email
                    </label>
                    <input
                      type="email"
                      name="storeEmail"
                      value={settings.storeEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                      placeholder="support@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5">
                      Store Phone
                    </label>
                    <input
                      type="tel"
                      name="storePhone"
                      value={settings.storePhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Store Address
                  </label>
                  <textarea
                    name="storeAddress"
                    value={settings.storeAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                    placeholder="Enter your store address"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-3">
                Regional Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Time Zone
                  </label>
                  <select
                    name="timeZone"
                    value={settings.timeZone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                  >
                    <option className="bg-black">UTC</option>
                    <option className="bg-black">EST</option>
                    <option className="bg-black">CST</option>
                    <option className="bg-black">MST</option>
                    <option className="bg-black">PST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                  >
                    <option className="bg-black">USD</option>
                    <option className="bg-black">EUR</option>
                    <option className="bg-black">GBP</option>
                    <option className="bg-black">CAD</option>
                    <option className="bg-black">AUD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tax & Shipping */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-3">
                Tax & Shipping
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={settings.taxRate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                    placeholder="8.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Standard Shipping Cost ($)
                  </label>
                  <input
                    type="number"
                    name="shippingCost"
                    value={settings.shippingCost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD713]/50"
                    placeholder="5.00"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded text-sm transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-white/10 text-white rounded text-sm transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
