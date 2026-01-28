import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface LegalPageItem {
  id: string;
  title: string;
  page_type: "privacy" | "terms" | "shipping" | "returns" | "legal" | "gdpr" | "ccpa";
}

const pageTypeLabels: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  shipping: "Shipping Policy",
  returns: "Return & Refund",
  legal: "Artwork, Authorization, and Ownership",
  gdpr: "GDPR Compliance",
  ccpa: "CCPA Rights",
};

const getPageTypeLabel = (pageType: string): string => {
  return pageTypeLabels[pageType] || pageType;
};

export default function Footer() {
  const [legalPages, setLegalPages] = useState<LegalPageItem[]>([]);

  useEffect(() => {
    const fetchLegalPages = async () => {
      try {
        const response = await fetch("/api/legal-pages");
        if (response.ok) {
          const data = await response.json();
          setLegalPages(data.pages || []);
        }
      } catch (err) {
        console.error("Error fetching legal pages:", err);
      }
    };

    fetchLegalPages();
  }, []);

  return (
    <footer className="bg-black text-white mt-auto">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-12"
        style={{ maxWidth: "1200px" }}
      >
        {/* Top Section - Logo, Email, Hours, Instagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-8 border-b border-gray-800">
          {/* Logo and Brand Info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Fe6aa9b4de7094c5282fd1abccfc14588"
                  alt="Sticky Slap Logo"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <span
                style={{ fontFamily: "Goldplay, sans-serif" }}
                className="font-semibold text-xl"
              >
                Sticky Slap
              </span>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <span className="text-white">Email:</span>
                <br />
                <a
                  href="mailto:sticky@stickyslap.com"
                  className="hover:text-white transition-colors"
                >
                  sticky@stickyslap.com
                </a>
              </p>
              <p>
                <span className="text-white">Hours:</span>
                <br />
                Monday - Friday: 10am - 5pm
              </p>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex md:justify-end">
            <a
              href="https://instagram.com/stickyslapco"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-gray-300 transition-colors group"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 via-red-600 to-yellow-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-pink-600/50 transition-shadow">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Follow Us</p>
                <p className="text-xs text-gray-400">@stickyslapco</p>
              </div>
            </a>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {/* Products & Deals */}
          <div>
            <h3
              style={{ fontFamily: "Goldplay, sans-serif" }}
              className="font-semibold text-lg mb-4 text-white"
            >
              Shop
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="hover:text-white transition-colors"
                >
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h3
              style={{ fontFamily: "Goldplay, sans-serif" }}
              className="font-semibold text-lg mb-4 text-white"
            >
              Account
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/account-settings"
                  className="hover:text-white transition-colors"
                >
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              style={{ fontFamily: "Goldplay, sans-serif" }}
              className="font-semibold text-lg mb-4 text-white"
            >
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {legalPages.length > 0 ? (
                legalPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/${page.page_type}`}
                      className="hover:text-white transition-colors"
                    >
                      {getPageTypeLabel(page.page_type)}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      to="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="hover:text-white transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Sticky Slap LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
