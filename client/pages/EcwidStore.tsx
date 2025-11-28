import { useEffect } from "react";
import Header from "@/components/Header";

const ECWID_STORE_ID = "120154275";

export default function EcwidStore() {
  useEffect(() => {
    // Add CSS to hide Ecwid branding
    const style = document.createElement("style");
    style.textContent = `
      .ec-powered-by,
      .ecwid-powered-by,
      .ec-footer,
      .ecwid-footer,
      .ec-store-footer,
      .ecwid-store-footer,
      [class*="poweredby"],
      .ec-powered-text {
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
      script2.textContent = `xProductBrowser("categoriesPerRow=3","views=grid(20,3) list(60) table(60)","categoryView=grid","searchView=list","id=my-store-${ECWID_STORE_ID}");`;
      document.body.appendChild(script2);

      // Hide powered by text after a short delay to ensure Ecwid is fully loaded
      setTimeout(() => {
        document.querySelectorAll("*").forEach((el) => {
          if (el.textContent && el.textContent.includes("Powered by")) {
            el.style.display = "none";
          }
        });
      }, 1000);
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
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Ecwid Store</h1>
          <p className="text-gray-600 mb-8">
            Browse our complete collection of stickers and products
          </p>

          <div id={`my-store-${ECWID_STORE_ID}`}></div>
        </div>
      </main>
    </div>
  );
}
