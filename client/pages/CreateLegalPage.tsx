import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

interface LegalPageFormData {
  page_type: string;
  title: string;
  content: string;
  visibility: "visible" | "hidden";
}

const pageTypeOptions: Array<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: "privacy",
    label: "Privacy Policy",
    description: "Your privacy and data handling policies",
  },
  {
    value: "terms",
    label: "Terms of Service",
    description: "Terms and conditions of use",
  },
  {
    value: "shipping",
    label: "Shipping Policy",
    description: "Shipping rates and delivery information",
  },
  {
    value: "returns",
    label: "Returns Policy",
    description: "Return and refund policies",
  },
  {
    value: "legal",
    label: "Artwork, Authorization, and Ownership",
    description: "Artwork format & specifications and authorization",
  },
];

export default function CreateLegalPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<LegalPageFormData>({
    page_type: "privacy",
    title: "",
    content: "",
    visibility: "visible",
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
    setIsLoading(false);
  }, [navigate]);

  const validateForm = () => {
    if (!formData.page_type) {
      setError("Page type is required");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Page title is required");
      return false;
    }
    if (!formData.content.trim()) {
      setError("Page content is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/legal-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create legal page");
      }

      setSuccess("Legal page created successfully!");

      setTimeout(() => {
        navigate("/admin/legal-pages");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create legal page",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-white/60">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/legal-pages")}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Legal Pages
            </button>
            <h1 className="text-3xl font-bold text-white">Create Legal Page</h1>
            <p className="text-white/60 mt-1">
              Create a new legal, privacy, or policy page
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Page Type */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-4">
                Page Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pageTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.page_type === option.value
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="page_type"
                      value={option.value}
                      checked={formData.page_type === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          page_type: e.target
                            .value as LegalPageFormData["page_type"],
                        })
                      }
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-white/50 text-sm">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Title *
              </label>
              <Input
                type="text"
                placeholder="e.g., Our Privacy Policy"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            {/* Content */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Content *
              </label>
              <p className="text-xs text-white/50 mb-3">
                Write your page content here
              </p>
              <Textarea
                placeholder="Start writing your page content here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500 min-h-96 font-mono text-sm"
              />
            </div>

            {/* Visibility */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="visible"
                    checked={formData.visibility === "visible"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Published (Visible)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="hidden"
                    checked={formData.visibility === "hidden"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Hidden (Draft)</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={() => navigate("/admin/legal-pages")}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
}
