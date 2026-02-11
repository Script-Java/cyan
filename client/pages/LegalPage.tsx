import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

interface LegalPageData {
  id: string;
  page_type: string;
  title: string;
  content: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

const pageTypeLabels: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  shipping: "Shipping Policy",
  returns: "Returns Policy",
  legal: "Legal Notice",
  gdpr: "GDPR Compliance",
  ccpa: "CCPA Rights",
};

const pageTypeColors: Record<string, string> = {
  privacy: "from-blue-600 to-blue-800",
  terms: "from-purple-600 to-purple-800",
  shipping: "from-green-600 to-green-800",
  returns: "from-orange-600 to-orange-800",
  legal: "from-red-600 to-red-800",
  gdpr: "from-indigo-600 to-indigo-800",
  ccpa: "from-amber-600 to-amber-800",
};

export default function LegalPage() {
  const { pageType } = useParams<{ pageType: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLegalPage();
  }, [pageType]);

  const fetchLegalPage = async () => {
    try {
      if (!pageType) {
        setError("Invalid page type");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/legal/${pageType}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("This legal page is not available yet");
        } else if (response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Unable to load page (Status: ${response.status})`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setPage(data);
    } catch (err) {
      console.warn("Error fetching legal page:", err);
      setError("Unable to load legal page. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div
          className={`bg-gradient-to-br ${pageType && pageTypeColors[pageType] ? pageTypeColors[pageType] : "from-gray-600 to-gray-800"} py-12 md:py-16`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-white/90" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {isLoading ? "Loading..." : page?.title || "Legal Page"}
              </h1>
            </div>

            {page && (
              <p className="text-white/80 text-sm">
                Last updated:{" "}
                {new Date(page.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white/60">Loading legal page...</div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          ) : page ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed space-y-4">
                  {page.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  This page was last updated on{" "}
                  {new Date(page.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">No content available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
