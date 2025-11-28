import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";

const ECWID_STORE_ID = "120154275";

export default function EcwidStore() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    // Add CSS to ensure Ecwid store is visible and hide branding
    const style = document.createElement("style");
    style.textContent = `
      #my-store-${ECWID_STORE_ID} {
        display: block !important;
        min-height: auto !important;
      }
      .ec-powered-by,
      .ecwid-powered-by,
      .ec-powered-by-link,
      .ecwid-powered-by-link {
        display: none !important;
      }
      .ec-store > .powered-by,
      .ecwid > .powered-by {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Load and initialize Ecwid script
    const script1 = document.createElement("script");
    script1.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code&data_date=2025-11-28`;
    script1.setAttribute("data-cfasync", "false");
    script1.async = true;
    document.body.appendChild(script1);

    script1.onload = () => {
      // Initialize product browser
      const script2 = document.createElement("script");
      script2.type = "text/javascript";

      // Build command with optional search
      let command = `xProductBrowser("categoriesPerRow=3","views=grid(20,3) list(60) table(60)","categoryView=grid","searchView=list"`;

      // Add search query if provided
      if (searchQuery) {
        command += `,"defaultSearch=${encodeURIComponent(searchQuery)}"`;
      }

      command += `,"id=my-store-${ECWID_STORE_ID}");`;
      script2.textContent = command;
      document.body.appendChild(script2);

      // Ensure the store container is visible after Ecwid loads
      setTimeout(() => {
        const storeContainer = document.getElementById(
          `my-store-${ECWID_STORE_ID}`,
        );
        if (storeContainer) {
          storeContainer.style.display = "block";
        }
      }, 500);
    };

    return () => {
      // Cleanup scripts if needed
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div id={`my-store-${ECWID_STORE_ID}`}></div>
        </div>
      </main>
    </div>
  );
}
