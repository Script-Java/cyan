import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface LegalPage {
  id: string;
  page_type: "privacy" | "terms" | "shipping" | "returns" | "legal" | "gdpr" | "ccpa";
  title: string;
  content: string;
  visibility: "visible" | "hidden";
  created_at: string;
  updated_at: string;
}

const pageTypeLabels: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  shipping: "Shipping Policy",
  returns: "Returns Policy",
  legal: "Artwork, Authorization, and Ownership",
};

const pageTypeColors: Record<string, string> = {
  privacy: "bg-blue-100 text-blue-700",
  terms: "bg-purple-100 text-purple-700",
  shipping: "bg-green-100 text-green-700",
  returns: "bg-orange-100 text-orange-700",
  legal: "bg-red-100 text-red-700",
};

const getPageTypeColor = (pageType: string): string => {
  return pageTypeColors[pageType] || "bg-gray-100 text-gray-700";
};

const getPageTypeLabel = (pageType: string): string => {
  return pageTypeLabels[pageType] || pageType;
};

export default function AdminLegalPages() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
    fetchLegalPages();
  }, [navigate]);

  const fetchLegalPages = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/legal-pages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (err) {
      console.error("Error fetching legal pages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string, pageType: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the ${getPageTypeLabel(pageType)} page?`,
      )
    ) {
      return;
    }

    setIsDeleting(pageId);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/legal-pages/${pageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      setSuccess("Page deleted successfully");
      setPages(pages.filter((p) => p.id !== pageId));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete page");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pageTypeLabels[page.page_type]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    Legal Pages
                  </h1>
                  <p className="text-gray-600">
                    Manage your legal, privacy, and policy pages
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/admin/create-legal-page")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title or page type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 focus:border-blue-500"
              />
            </div>

            {/* Pages Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-gray-600">Loading pages...</div>
              </div>
            ) : filteredPages.length === 0 && pages.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No legal pages created yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first legal page to get started
                </p>
                <Button
                  onClick={() => navigate("/admin/create-legal-page")}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create First Page
                </Button>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No pages match your search</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {page.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPageTypeColor(page.page_type)}`}
                          >
                            {getPageTypeLabel(page.page_type)}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {page.content.substring(0, 150)}...
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {page.visibility === "visible" ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Hidden</span>
                              </>
                            )}
                          </div>
                          <span>
                            Updated{" "}
                            {new Date(page.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            navigate(`/admin/edit-legal-page/${page.id}`)
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit page"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePage(page.id, page.page_type)
                          }
                          disabled={isDeleting === page.id}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Stats */}
            {!isLoading && pages.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Pages</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pages.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Published</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {pages.filter((p) => p.visibility === "visible").length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Hidden</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {pages.filter((p) => p.visibility === "hidden").length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
