import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PolicyContent {
  guarantee_days: number;
  return_conditions: string[];
  how_to_return: string[];
  defective_items_days: number;
  refund_timeline: string;
  non_returnable_items: string[];
  contact_email: string;
  full_policy: string;
}

export default function AdminReturnRefundPolicy() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [policy, setPolicy] = useState<PolicyContent>({
    guarantee_days: 30,
    return_conditions: [
      "Stickers must be unused and in original condition",
      "Original packaging must be intact",
      "Proof of purchase (order number) is required",
      "Return shipping is the customer's responsibility",
    ],
    how_to_return: [
      "Contact our support team at support@stickyhub.com with your order number",
      "Provide a reason for your return request",
      "We'll review your request and provide return shipping instructions",
      "Ship the item back to us using the provided address",
      "Once received and inspected, we'll process your refund (5-7 business days)",
    ],
    defective_items_days: 7,
    refund_timeline: "5-7 business days after we receive and inspect your return",
    non_returnable_items: [
      "Used, applied, or partially used stickers",
      "Items without original packaging",
      "Items returned after 30 days",
      "Wholesale or bulk orders (special terms apply)",
    ],
    contact_email: "support@stickyhub.com",
    full_policy: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchPolicy();
  }, [navigate]);

  const fetchPolicy = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/return-refund-policy", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPolicy(data.policy || policy);
      }
    } catch (err) {
      console.error("Error fetching policy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/return-refund-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policy),
      });

      if (response.ok) {
        toast.success("Return & Refund Policy updated successfully!");
        setSuccess("Policy saved successfully!");
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to save policy");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save policy";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const addReturnCondition = () => {
    setPolicy({
      ...policy,
      return_conditions: [...policy.return_conditions, ""],
    });
  };

  const updateReturnCondition = (index: number, value: string) => {
    const updated = [...policy.return_conditions];
    updated[index] = value;
    setPolicy({ ...policy, return_conditions: updated });
  };

  const removeReturnCondition = (index: number) => {
    setPolicy({
      ...policy,
      return_conditions: policy.return_conditions.filter((_, i) => i !== index),
    });
  };

  const addHowToStep = () => {
    setPolicy({
      ...policy,
      how_to_return: [...policy.how_to_return, ""],
    });
  };

  const updateHowToStep = (index: number, value: string) => {
    const updated = [...policy.how_to_return];
    updated[index] = value;
    setPolicy({ ...policy, how_to_return: updated });
  };

  const removeHowToStep = (index: number) => {
    setPolicy({
      ...policy,
      how_to_return: policy.how_to_return.filter((_, i) => i !== index),
    });
  };

  const addNonReturnableItem = () => {
    setPolicy({
      ...policy,
      non_returnable_items: [...policy.non_returnable_items, ""],
    });
  };

  const updateNonReturnableItem = (index: number, value: string) => {
    const updated = [...policy.non_returnable_items];
    updated[index] = value;
    setPolicy({ ...policy, non_returnable_items: updated });
  };

  const removeNonReturnableItem = (index: number) => {
    setPolicy({
      ...policy,
      non_returnable_items: policy.non_returnable_items.filter((_, i) => i !== index),
    });
  };

  if (!isAuthenticated || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy</h1>
          <p className="text-gray-600 mt-2">Manage your return and refund policy content</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Basic Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Guarantee Days</Label>
                <Input
                  type="number"
                  value={policy.guarantee_days || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPolicy({ ...policy, guarantee_days: val === "" ? 0 : parseInt(val) });
                  }}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-700">Defective Items Days</Label>
                <Input
                  type="number"
                  value={policy.defective_items_days || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPolicy({ ...policy, defective_items_days: val === "" ? 0 : parseInt(val) });
                  }}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Contact Email</Label>
              <Input
                type="email"
                value={policy.contact_email}
                onChange={(e) => setPolicy({ ...policy, contact_email: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-700">Refund Timeline</Label>
              <Input
                value={policy.refund_timeline}
                onChange={(e) => setPolicy({ ...policy, refund_timeline: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Return Conditions */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Return Conditions</h2>
              <Button
                type="button"
                onClick={addReturnCondition}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Add Condition
              </Button>
            </div>

            <div className="space-y-2">
              {policy.return_conditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={condition}
                    onChange={(e) => updateReturnCondition(index, e.target.value)}
                    placeholder="Enter condition"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeReturnCondition(index)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* How to Return Steps */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">How to Return (Steps)</h2>
              <Button
                type="button"
                onClick={addHowToStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Add Step
              </Button>
            </div>

            <div className="space-y-2">
              {policy.how_to_return.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={step}
                      onChange={(e) => updateHowToStep(index, e.target.value)}
                      placeholder="Enter step description"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeHowToStep(index)}
                    className="bg-red-600 hover:bg-red-700 mt-0"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Non-Returnable Items</h2>
              <Button
                type="button"
                onClick={addNonReturnableItem}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {policy.non_returnable_items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateNonReturnableItem(index, e.target.value)}
                    placeholder="Enter non-returnable item"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeNonReturnableItem(index)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
