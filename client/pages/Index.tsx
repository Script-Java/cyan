import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Truck,
  Palette,
  Award,
  Heart,
  Sticker,
} from "lucide-react";
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

const coral = "#F63049";
const navy = "#111F35";
const burgundy = "#8A244B";

const faqItems: FAQItem[] = [
  {
    question: "What makes Stickerland custom stickers special?",
    answer:
      "Stickerland creates premium quality custom stickers with vibrant colors, durable finishes, and meticulous attention to detail. We use the highest quality vinyl materials and precision printing techniques to ensure your stickers look stunning and withstand the test of time.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "We offer complimentary ground shipping on all orders within the US. Most orders ship within 2-3 business days and arrive within 5-7 business days. Express shipping options are available for time-sensitive projects.",
  },
  {
    question: "Can I get a proof before my order ships?",
    answer:
      "Every Stickerland order includes a complimentary digital proof for your review before production. This ensures your design meets our premium standards and your exact specifications.",
  },
  {
    question: "What are the different vinyl finish options?",
    answer:
      "We offer Satin & Lamination for an elegant, sophisticated look and Gloss & Lamination for maximum vibrancy and shine. Both finishes include protective lamination for exceptional durability.",
  },
  {
    question: "Are Stickerland stickers waterproof?",
    answer:
      "Absolutely. All Stickerland stickers are crafted to be fully waterproof and UV-resistant, making them perfect for laptops, water bottles, outdoor gear, and any environment.",
  },
  {
    question: "Can I use my own design?",
    answer:
      "Of course. Upload your own artwork or collaborate with our design team. We accept all major file formats and provide guidelines to ensure optimal print quality.",
  },
];

const features = [
  {
    icon: Sticker,
    title: "Premium Quality",
    description: "High-grade vinyl with vibrant, long-lasting colors",
  },
  {
    icon: Shield,
    title: "Waterproof & Durable",
    description: "UV-resistant and weatherproof for any environment",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description: "Most orders ship within 2-3 business days",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary delivery on all US orders",
  },
  {
    icon: Palette,
    title: "Custom Designs",
    description: "Upload your artwork or use our design tools",
  },
  {
    icon: Award,
    title: "Free Proofing",
    description: "Review before production at no extra cost",
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
    <main className="bg-white min-h-screen">
      {/* Hero Section - Vibrant & Fun */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${navy} 0%, #1a2d4a 50%, #2d3a5c 100%)` }}
        />
        
        {/* Decorative Elements */}
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: coral }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: coral }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-5"
          style={{ background: `radial-gradient(circle, ${coral} 0%, transparent 70%)` }}
        />
        
        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div 
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 border"
                  style={{ 
                    background: `${coral}15`,
                    borderColor: `${coral}30`
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: coral }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: coral }}>
                    Premium Custom Stickers
                  </span>
                </div>

                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-8">
                  Design Your
                  <span 
                    className="block mt-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${coral} 0%, #FF6B7A 50%, ${burgundy} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    Masterpiece
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Create stunning custom stickers that make your brand pop. 
                  Vibrant colors, premium quality, delivered fast.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/product-page/00004"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-1"
                    style={{ 
                      background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                      boxShadow: `0 20px 40px -10px ${coral}50`
                    }}
                  >
                    Start Creating
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/ecwid-store"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    Shop Collection
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start flex-wrap">
                  <div className="flex items-center gap-2 text-white/60">
                    <Star className="w-5 h-5 fill-current" style={{ color: coral }} />
                    <span className="text-sm">4.9/5 Rating</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-2 text-white/60">
                    <Heart className="w-5 h-5" style={{ color: coral }} />
                    <span className="text-sm">50K+ Happy Customers</span>
                  </div>
                  <div className="h-4 w-px bg-white/20 hidden sm:block" />
                  <div className="flex items-center gap-2 text-white/60">
                    <Truck className="w-5 h-5" style={{ color: coral }} />
                    <span className="text-sm">Free Shipping</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Featured Image */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-square max-w-lg mx-auto">
                  {/* Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                    style={{ background: `linear-gradient(135deg, ${coral} 0%, ${burgundy} 100%)` }}
                  />
                  
                  {/* Image Container */}
                  <div 
                    className="relative rounded-3xl p-8 shadow-2xl"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop"
                      alt="Premium Custom Stickers"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                    
                    {/* Floating Badge */}
                    <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)` }}
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider" style={{ color: "#64748b" }}>Starting at</p>
                          <p className="text-2xl font-heading font-bold" style={{ color: navy }}>$0.25</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#fafafa" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-xs font-semibold uppercase tracking-widest"
              style={{ 
                background: `${coral}10`,
                borderColor: `${coral}20`,
                color: coral
              }}
            >
              <Heart className="w-3 h-3" />
              Why Choose Us
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4" style={{ color: navy }}>
              The Stickerland Difference
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
              We combine premium materials with expert craftsmanship to create stickers that exceed expectations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:shadow-xl"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${navy} 0%, #1e3a5f 100%)`,
                    boxShadow: "0 10px 30px -10px rgba(17, 31, 53, 0.3)"
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ color: navy }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#64748b" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: navy }}>
        {/* Background Elements */}
        <div 
          className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: coral }}
        />
        <div 
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: coral }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-xs font-semibold uppercase tracking-widest"
              style={{ 
                background: `${coral}15`,
                borderColor: `${coral}30`,
                color: coral
              }}
            >
              <Sparkles className="w-3 h-3" />
              Gallery
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Featured Creations
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-white/60">
              Explore stunning designs from our community of creators.
            </p>
          </div>

          {loadingGallery ? (
            <div className="flex items-center justify-center h-64">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: coral }}
              />
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="relative">
              <div className="aspect-[16/9] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={galleryImages[currentImageIndex]?.image_url}
                  alt={galleryImages[currentImageIndex]?.image_alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-heading text-2xl font-semibold text-white mb-2">
                    {galleryImages[currentImageIndex]?.title}
                  </h3>
                  <p className="text-white/70">
                    {galleryImages[currentImageIndex]?.description}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={handlePrevImage}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: index === currentImageIndex ? "32px" : "8px",
                        background: index === currentImageIndex ? coral : "rgba(255,255,255,0.3)"
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextImage}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60">
              <p>No gallery images available.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#fafafa" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-xs font-semibold uppercase tracking-widest"
              style={{ 
                background: `${coral}10`,
                borderColor: `${coral}20`,
                color: coral
              }}
            >
              <Sparkles className="w-3 h-3" />
              FAQ
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4" style={{ color: navy }}>
              Questions & Answers
            </h2>
            <p className="text-lg" style={{ color: "#64748b" }}>
              Everything you need to know about our premium sticker service.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-heading text-lg font-semibold pr-4" style={{ color: navy }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                    style={{ 
                      color: coral,
                      transform: expandedFAQ === index ? "rotate(180deg)" : "rotate(0deg)"
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: expandedFAQ === index ? "500px" : "0" }}
                >
                  <p className="px-6 pb-6 leading-relaxed" style={{ color: "#64748b" }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div 
            className="relative rounded-[2.5rem] p-12 sm:p-16 overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${navy} 0%, #1e3a5f 100%)`
            }}
          >
            {/* Background Elements */}
            <div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: coral }}
            />
            <div 
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
              style={{ background: coral }}
            />

            <div className="relative z-10 text-center">
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Ready to Create?
              </h2>
              <p className="text-white/70 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied customers and bring your designs to life 
                with premium custom stickers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/product-page/00004"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                    boxShadow: `0 20px 40px -10px ${coral}50`
                  }}
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/ecwid-store"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                >
                  Browse Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
