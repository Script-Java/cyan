import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Calendar, ArrowRight, Search, X, FileText, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LegalPageItem {
  id: string;
  title: string;
  page_type: "privacy" | "terms" | "shipping" | "returns" | "legal";
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
  legal: "Legal Notice",
};

const pageTypeColors: Record<string, { bg: string; text: string }> = {
  privacy: { bg: "bg-blue-50", text: "text-blue-700" },
  terms: { bg: "bg-purple-50", text: "text-purple-700" },
  shipping: { bg: "bg-green-50", text: "text-green-700" },
  returns: { bg: "bg-orange-50", text: "text-orange-700" },
  legal: { bg: "bg-red-50", text: "text-red-700" },
};

export default function LegalPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<LegalPageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPageTypes, setSelectedPageTypes] = useState<string[]>([]);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  useEffect(() => {
    fetchLegalPages();
  }, []);

  const fetchLegalPages = async () => {
    try {
      const response = await fetch("/api/legal-pages");
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

  const allPageTypes = Array.from(
    new Set(pages.map((page) => page.page_type))
  ).sort();

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pageTypeLabels[page.page_type]
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPageType =
      selectedPageTypes.length === 0 || selectedPageTypes.includes(page.page_type);

    return matchesSearch && matchesPageType;
  });

  const togglePageType = (pageType: string) => {
    setSelectedPageTypes((prev) =>
      prev.includes(pageType)
        ? prev.filter((t) => t !== pageType)
        : [...prev, pageType]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                Legal Pages
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Review our policies, terms of service, and legal information
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 pl-12 pr-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base"
                />
              </div>
            </div>
          </div>

          {/* Page Type Filters */}
          {allPageTypes.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span>Filter by type</span>
                {selectedPageTypes.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {selectedPageTypes.length} selected
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allPageTypes.map((pageType) => (
                  <Button
                    key={pageType}
                    variant={
                      selectedPageTypes.includes(pageType) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => togglePageType(pageType)}
                    className={`rounded-full transition-all ${
                      selectedPageTypes.includes(pageType)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {pageTypeLabels[pageType]}
                    {selectedPageTypes.includes(pageType) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Legal Pages List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-500">Loading legal pages...</div>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                {pages.length === 0
                  ? "No legal pages available"
                  : "No pages match your search"}
              </p>
              <p className="text-gray-500 mb-6">
                {pages.length === 0
                  ? "Check back soon for more information!"
                  : "Try adjusting your search or filters"}
              </p>
              {selectedPageTypes.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedPageTypes([])}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-sm text-gray-600 font-medium mb-6">
                Showing {filteredPages.length} of {pages.length} pages
              </div>
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => navigate(`/${page.page_type}`)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex gap-6 p-6">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-all duration-300">
                      <FileText className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Top Section */}
                      <div>
                        {/* Date and Badge Row */}
                        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">
                              {formatDate(page.updated_at)}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(page.updated_at)}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium border-transparent ${pageTypeColors[page.page_type].bg} ${pageTypeColors[page.page_type].text}`}
                          >
                            {pageTypeLabels[page.page_type]}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {page.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-base mb-4 line-clamp-2 leading-relaxed">
                          {page.content.substring(0, 200)}
                          {page.content.length > 200 ? "..." : ""}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-gray-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We're committed to transparency and providing clear information about our policies and practices.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/blogs")}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/support")}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Pages Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                {pages.slice(0, 3).map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => navigate(`/${page.page_type}`)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {pageTypeLabels[page.page_type]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-gray-600 text-sm">
                © 2024 Your Company. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Last updated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
