import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Share2,
  Trash2,
  AlertCircle,
  Loader,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Header from "@/components/Header";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
}

interface Address {
  id: number;
  first_name: string;
  last_name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_code: string;
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"personal" | "social" | "delete">(
    "personal",
  );

  // Personal Info Form State
  const [personalFormData, setPersonalFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [addressFormData, setAddressFormData] = useState({
    firstName: "",
    lastName: "",
    street1: "",
    street2: "",
    city: "",
    stateOrProvince: "",
    postalCode: "",
    countryCode: "US",
  });
  const [personalFormLoading, setPersonalFormLoading] = useState(false);
  const [personalFormError, setPersonalFormError] = useState("");
  const [personalFormSuccess, setPersonalFormSuccess] = useState(false);

  // Address Form State
  const [addressFormLoading, setAddressFormLoading] = useState(false);
  const [addressFormError, setAddressFormError] = useState("");
  const [addressFormSuccess, setAddressFormSuccess] = useState(false);

  // Social Media Form State
  const [socialFormData, setSocialFormData] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
  });
  const [socialFormLoading, setSocialFormLoading] = useState(false);
  const [socialFormError, setSocialFormError] = useState("");
  const [socialFormSuccess, setSocialFormSuccess] = useState(false);

  // Account Deletion State
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteFormLoading, setDeleteFormLoading] = useState(false);
  const [deleteFormError, setDeleteFormError] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/customers/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          let errorData: any;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: response.statusText };
          }
          const errorMessage =
            errorData.error ||
            `Failed to fetch customer data (${response.status})`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.customer) {
          throw new Error("No customer data received from server");
        }

        setCustomer(data.customer);

        // Initialize form data
        setPersonalFormData({
          firstName: data.customer.firstName || "",
          lastName: data.customer.lastName || "",
          email: data.customer.email || "",
          phone: data.customer.phone || "",
        });

        // Initialize first address if available
        if (data.customer.addresses && data.customer.addresses.length > 0) {
          const firstAddress = data.customer.addresses[0];
          setSelectedAddressId(firstAddress.id);
          setAddressFormData({
            firstName: firstAddress.first_name || "",
            lastName: firstAddress.last_name || "",
            street1: firstAddress.street_1 || "",
            street2: firstAddress.street_2 || "",
            city: firstAddress.city || "",
            stateOrProvince: firstAddress.state_or_province || "",
            postalCode: firstAddress.postal_code || "",
            countryCode: firstAddress.country_code || "US",
          });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load account settings";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate]);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPersonalFormLoading(true);
      setPersonalFormError("");
      setPersonalFormSuccess(false);

      const response = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalFormData.firstName,
          lastName: personalFormData.lastName,
          email: personalFormData.email,
          phone: personalFormData.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update personal information",
        );
      }

      const data = await response.json();
      setCustomer({
        ...customer!,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email,
        phone: data.customer.phone,
      });

      setPersonalFormSuccess(true);
      setTimeout(() => setPersonalFormSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update personal information";
      setPersonalFormError(message);
    } finally {
      setPersonalFormLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setAddressFormLoading(true);
      setAddressFormError("");
      setAddressFormSuccess(false);

      const method = selectedAddressId ? "PATCH" : "POST";
      const url = selectedAddressId
        ? `/api/customers/me/addresses/${selectedAddressId}`
        : "/api/customers/me/addresses";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: addressFormData.firstName,
          lastName: addressFormData.lastName,
          street1: addressFormData.street1,
          street2: addressFormData.street2,
          city: addressFormData.city,
          stateOrProvince: addressFormData.stateOrProvince,
          postalCode: addressFormData.postalCode,
          countryCode: addressFormData.countryCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save address");
      }

      setAddressFormSuccess(true);
      setTimeout(() => setAddressFormSuccess(false), 3000);

      // Refresh customer data to get updated addresses
      const customerRes = await fetch("/api/customers/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customerData = await customerRes.json();
      setCustomer(customerData.customer);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save address";
      setAddressFormError(message);
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    const token = localStorage.getItem("authToken");

    if (!token || !confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/me/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete address");
      }

      // Refresh customer data
      const customerRes = await fetch("/api/customers/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customerData = await customerRes.json();
      setCustomer(customerData.customer);

      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setAddressFormData({
          firstName: "",
          lastName: "",
          street1: "",
          street2: "",
          city: "",
          stateOrProvince: "",
          postalCode: "",
          countryCode: "US",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete address";
      setAddressFormError(message);
    }
  };

  const handleSocialMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSocialFormLoading(true);
      setSocialFormError("");
      setSocialFormSuccess(false);

      // Store social media handles in customer company field as JSON
      const socialMediaString = Object.entries(socialFormData)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ");

      const response = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: customer?.firstName,
          lastName: customer?.lastName,
          email: customer?.email,
          phone: customer?.phone,
          // Note: This would require a custom field in BigCommerce for proper storage
          // For now, we're storing it alongside other customer data
          company: socialMediaString || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update social media");
      }

      setSocialFormSuccess(true);
      setTimeout(() => setSocialFormSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update social media";
      setSocialFormError(message);
    } finally {
      setSocialFormLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      deleteConfirmation.toLowerCase() !== "delete my account" &&
      deleteConfirmation.toLowerCase() !== "delete my account."
    ) {
      setDeleteFormError(
        'Please type "Delete my account" to confirm account deletion.',
      );
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDeleteFormLoading(true);
      setDeleteFormError("");

      const response = await fetch("/api/customers/me/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Clear auth data and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("customerId");
      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete account";
      setDeleteFormError(message);
    } finally {
      setDeleteFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading account settings...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <DashboardLayout>
          <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your personal information and account preferences
              </p>
            </div>

            {/* Overall Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === "personal"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("social")}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === "social"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Social Media
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("delete")}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === "delete"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </div>
                </button>
              </div>
            </div>

            {/* Personal Information Tab */}
            {activeTab === "personal" && customer && (
              <div className="space-y-8 animate-fadeIn">
                {/* Personal Info Form */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Personal Information
                  </h2>

                  {personalFormError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">
                        {personalFormError}
                      </p>
                    </div>
                  )}

                  {personalFormSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Personal information updated successfully!
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={handlePersonalInfoSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={personalFormData.firstName}
                          onChange={(e) =>
                            setPersonalFormData({
                              ...personalFormData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={personalFormData.lastName}
                          onChange={(e) =>
                            setPersonalFormData({
                              ...personalFormData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={personalFormData.email}
                        onChange={(e) =>
                          setPersonalFormData({
                            ...personalFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={personalFormData.phone}
                        onChange={(e) =>
                          setPersonalFormData({
                            ...personalFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={personalFormLoading}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {personalFormLoading && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      Save Personal Information
                    </button>
                  </form>
                </div>

                {/* Shipping Address Section */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h2>

                  {addressFormError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{addressFormError}</p>
                    </div>
                  )}

                  {addressFormSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Address saved successfully!
                      </p>
                    </div>
                  )}

                  {/* Address Selection */}
                  {customer.addresses && customer.addresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        My Addresses
                      </label>
                      <div className="space-y-2">
                        {customer.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              selectedAddressId === addr.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-100 hover:border-blue-200 bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setAddressFormData({
                                firstName: addr.first_name || "",
                                lastName: addr.last_name || "",
                                street1: addr.street_1 || "",
                                street2: addr.street_2 || "",
                                city: addr.city || "",
                                stateOrProvince: addr.state_or_province || "",
                                postalCode: addr.postal_code || "",
                                countryCode: addr.country_code || "US",
                              });
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {addr.first_name} {addr.last_name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {addr.street_1}
                                  {addr.street_2 && <>, {addr.street_2}</>}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {addr.city}, {addr.state_or_province}{" "}
                                  {addr.postal_code}
                                </p>
                              </div>
                              {selectedAddressId === addr.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddress(addr.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete address"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.firstName}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.lastName}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={addressFormData.street1}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            street1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Apartment, Suite, etc. (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressFormData.street2}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            street2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Apartment 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.city}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.stateOrProvince}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              stateOrProvince: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="CA"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.postalCode}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="90210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Country Code
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.countryCode}
                          onChange={(e) =>
                            setAddressFormData({
                              ...addressFormData,
                              countryCode: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="US"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addressFormLoading}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addressFormLoading && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      Save Shipping Address
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === "social" && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Social Media Handles
                </h2>

                <p className="text-gray-600 mb-6">
                  Add your social media profiles to your account. This helps
                  customers and collaborators find you online.
                </p>

                {socialFormError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{socialFormError}</p>
                  </div>
                )}

                {socialFormSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Social media handles updated successfully!
                    </p>
                  </div>
                )}

                <form onSubmit={handleSocialMediaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Twitter / X (@username)
                    </label>
                    <input
                      type="text"
                      value={socialFormData.twitter}
                      onChange={(e) =>
                        setSocialFormData({
                          ...socialFormData,
                          twitter: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Instagram (@username)
                    </label>
                    <input
                      type="text"
                      value={socialFormData.instagram}
                      onChange={(e) =>
                        setSocialFormData({
                          ...socialFormData,
                          instagram: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Facebook (username or page name)
                    </label>
                    <input
                      type="text"
                      value={socialFormData.facebook}
                      onChange={(e) =>
                        setSocialFormData({
                          ...socialFormData,
                          facebook: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="yourname"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      TikTok (@username)
                    </label>
                    <input
                      type="text"
                      value={socialFormData.tiktok}
                      onChange={(e) =>
                        setSocialFormData({
                          ...socialFormData,
                          tiktok: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      LinkedIn (Profile URL or username)
                    </label>
                    <input
                      type="text"
                      value={socialFormData.linkedin}
                      onChange={(e) =>
                        setSocialFormData({
                          ...socialFormData,
                          linkedin: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="yourprofile"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={socialFormLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {socialFormLoading && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                    Save Social Media Handles
                  </button>
                </form>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === "delete" && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-red-900 mb-4">
                  Delete Account
                </h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-semibold mb-2">
                    ⚠️ This action cannot be undone
                  </p>
                  <p className="text-red-700 text-sm mb-4">
                    Deleting your account will:
                  </p>
                  <ul className="text-red-700 text-sm space-y-1 ml-4 list-disc">
                    <li>Permanently delete your account and all data</li>
                    <li>Remove your access to order history</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Delete your profile and preferences</li>
                  </ul>
                </div>

                {deleteFormError && (
                  <div className="mb-4 p-4 bg-red-200 border border-red-400 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{deleteFormError}</p>
                  </div>
                )}

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <p className="text-gray-700 text-sm">
                    To permanently delete your account, please type{" "}
                    <span className="font-semibold">"Delete my account"</span>{" "}
                    in the field below:
                  </p>

                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder='Type "Delete my account" to confirm'
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={
                      deleteFormLoading ||
                      (deleteConfirmation.toLowerCase() !==
                        "delete my account" &&
                        deleteConfirmation.toLowerCase() !==
                          "delete my account.")
                    }
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-sm hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleteFormLoading && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                    Delete My Account Permanently
                  </button>
                </form>
              </div>
            )}
          </div>
        </DashboardLayout>
      </main>
    </>
  );
}
