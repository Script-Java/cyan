import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Settings, Save, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "Sticker Hub",
    storeEmail: "support@stickerhub.com",
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
      // Simulate saving settings
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
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full min-h-screen bg-black text-white pb-20 md:pb-0">
        {/* Header Section */}
        <div className="bg-black border-b border-white/10">
          <div className="px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Settings className="w-8 h-8 text-[#FFD713]" />
                  Store Settings
                </h1>
                <p className="text-white/60 mt-2">
                  Configure your store details and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid - Desktop/Tablet Only */}
        <div className="hidden md:block border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="px-6 lg:px-8 py-6 sm:py-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Quick Navigation</h2>
            <AdminNavigationGrid />
          </div>
        </div>

        {/* Main Content */}
        <main className="px-6 lg:px-8 py-8">
              <div className="space-y-6">
                {/* Success Message */}
                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                    <p className="text-green-700 text-sm font-medium">
                      Settings saved successfully!
                    </p>
                  </div>
                )}

                {/* Store Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Store Information
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Basic details about your store
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        name="storeName"
                        value={settings.storeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter store name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Store Email
                        </label>
                        <input
                          type="email"
                          name="storeEmail"
                          value={settings.storeEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="support@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Store Phone
                        </label>
                        <input
                          type="tel"
                          name="storePhone"
                          value={settings.storePhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Address
                      </label>
                      <textarea
                        name="storeAddress"
                        value={settings.storeAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your store address"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Regional Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Regional Settings
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Configure timezone and currency preferences
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select
                        name="timeZone"
                        value={settings.timeZone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>UTC</option>
                        <option>EST</option>
                        <option>CST</option>
                        <option>MST</option>
                        <option>PST</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={settings.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>CAD</option>
                        <option>AUD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tax & Shipping */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Tax & Shipping
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Set default tax and shipping rates
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standard Shipping Cost ($)
                      </label>
                      <input
                        type="number"
                        name="shippingCost"
                        value={settings.shippingCost}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => navigate("/admin")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
