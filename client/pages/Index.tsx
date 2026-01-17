import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Check, ChevronDown, ChevronLeft, ChevronRight, Truck, Globe, Award } from "lucide-react";
import { useState, useEffect } from "react";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  order_index: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What makes Sticky Slap custom stickers special?",
    answer:
      "Sticky Slap is dedicated to creating premium quality custom stickers with vibrant colors, durable finishes, and fast shipping. We use the highest quality materials and printing techniques to ensure your stickers look amazing and last for years.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "We offer free ground shipping on all orders within the US. Most orders ship within 2-3 business days and arrive within 5-7 business days. Rush shipping options are available for expedited delivery.",
  },
  {
    question: "Can I get a proof before my order ships?",
    answer:
      "Absolutely! With every Sticky Slap order, you'll receive a free online proof to review before production. This ensures your design looks exactly how you want it.",
  },
  {
    question: "What are the different vinyl finish options?",
    answer:
      "We offer SATIN & LAMINATION for a subtle, professional look and GLOSS & LAMINATION for a vibrant, eye-catching finish. Both options include protective lamination for durability.",
  },
  {
    question: "Are Sticky Slap stickers waterproof?",
    answer:
      "Yes! All Sticky Slap stickers are waterproof and UV-resistant, making them perfect for laptops, water bottles, outdoor use, and more.",
  },
  {
    question: "Can I use my own design?",
    answer:
      "Of course! You can upload your own design or use our design tools. Just make sure your file meets our specifications for best results.",
  },
];

export default function Index() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setGalleryImages(data);
        }
      } catch (error) {
        console.error("Failed to fetch gallery images:", error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <Header />
      <main className="pt-16 bg-white text-gray-900 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-white text-gray-900 overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div
            className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
            style={{ maxWidth: "1100px" }}
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 backdrop-blur border border-blue-200 rounded-full px-3 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-900">
                  Premium Custom Stickers
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Design Your Own
                <span className="block bg-gradient-to-r from-[#FFD713] to-[#FFA500] bg-clip-text text-transparent">
                  Custom Stickers
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                Express yourself with high-quality, custom stickers. Perfect for
                laptops, water bottles, walls, and more. Fast shipping, amazing
                designs.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/product-page/00004"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 text-sm"
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ecwid-store"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          className="bg-white"
          style={{ padding: "16px 0 20px" }}
        >
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="backdrop-blur-xl bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900">
                    <span className="block">Free Shipping</span>
                    <span className="block text-gray-600 font-normal">on all orders</span>
                  </h3>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900">
                    <span className="block">Made in the US</span>
                    <span className="block text-gray-600 font-normal">premium quality</span>
                  </h3>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900">
                    <span className="block">Free Proof</span>
                    <span className="block text-gray-600 font-normal">with all orders</span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Collection Gallery */}
        <section className="bg-white py-12 sm:py-16">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            {loadingGallery ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm">Loading gallery...</p>
              </div>
            ) : galleryImages.length > 0 ? (
              <>
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Left: Main Carousel */}
                  <div className="lg:col-span-2">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {/* Main Image */}
                      <img
                        src={galleryImages[currentImageIndex].image_url}
                        alt={galleryImages[currentImageIndex].image_alt}
                        className="w-full h-96 object-cover"
                      />

                      {/* Counter */}
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs font-semibold">
                        {currentImageIndex + 1}/{galleryImages.length}
                      </div>

                      {/* Navigation Arrows */}
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                      {galleryImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-[#FFD713] w-6"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right: Gallery Thumbnails */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider">Gallery</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-[#FFD713]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.image_alt}
                            className="w-full h-24 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title and Description Below */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 uppercase">
                    Featured Collection
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Sticky Slap - Custom Stickers That Stick
                  </p>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    We specialize in high-quality custom sticker printing with a vibrant 8-color setup for bold, precise designs.
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Durability:</span> 4–5 years outdoors unlaminated, 5–8 years laminated
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Fast Turnaround:</span> Orders ship within 2 business days after artwork approval
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        Whether it's branding, promo drops, or stag tags — <span className="font-semibold">Sticky Slap makes stickers that go hard and last long.</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/ecwid-store"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FFD713] text-black rounded-lg font-bold hover:bg-[#ffc500] transition-all text-sm"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-12 sm:py-16 border-t border-gray-200">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Learn more about Sticky Slap custom stickers and our services
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-left">
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        expandedFAQ === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedFAQ === index && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8 text-center"
            style={{ maxWidth: "1100px" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Create?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Join thousands of customers who've created amazing custom stickers with
              Sticky Slap
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/product-page/00004"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 text-sm"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/ecwid-store"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="bg-white text-gray-600 border-t border-gray-200"
          style={{ padding: "32px 0" }}
        >
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Shop</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      Vinyl Stickers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      Holographic
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      Chrome
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Company</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/blogs" className="hover:text-gray-900 transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/support" className="hover:text-gray-900 transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Legal</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="/privacy" className="hover:text-gray-900 transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-gray-900 transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="/shipping" className="hover:text-gray-900 transition-colors">
                      Shipping
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Follow</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 transition-colors">
                      TikTok
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 text-center text-xs">
              <p>Built with ❤️ by © Sticky Slap LLC</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
