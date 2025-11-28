import { useEffect } from "react";
import Header from "@/components/Header";

const ECWID_STORE_ID = "120154275";

export default function EcwidStore() {
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

      /* Product options layout in 4 columns - target Ecwid structure */
      [class*="details-options"] {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 30px !important;
        width: 100% !important;
      }

      [class*="details-options"] > div,
      [class*="details-options"] > [class*="item"],
      [class*="details-options"] [class*="group"] {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
      }

      /* Target the actual option wrapper containers */
      .ec-product-details__option,
      .product-details__option,
      [class*="option"][class*="group"] {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      /* Ensure selects and inputs take full width */
      select[class*=""],
      [class*="select"],
      [class*="field"] {
        width: 100% !important;
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
      // Initialize product browser with 2-column layout
      const script2 = document.createElement("script");
      script2.type = "text/javascript";
      script2.textContent = `xProductBrowser("categoriesPerRow=2","views=grid(20,2) list(60) table(60)","categoryView=grid","searchView=list","id=my-store-${ECWID_STORE_ID}");`;
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
  }, []);

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
