"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Sparkles,
    Truck,
    Shield,
    Award,
    Star,
    Zap,
    ArrowRight,
    Heart,
    Sticker,
    Palette,
    Crown,
    Search,
} from "lucide-react";

const ECWID_STORE_ID = "120154275";
const coral = "#F63049";
const navy = "#111F35";

// Featured collections data
const featuredCollections = [
    {
        id: 1,
        name: "Custom Stickers",
        description: "Design your own unique stickers",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
        color: "from-pink-500 to-rose-500",
    },
    {
        id: 2,
        name: "Holographic",
        description: "Premium shiny finishes",
        image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&h=400&fit=crop",
        color: "from-purple-500 to-indigo-500",
    },
    {
        id: 3,
        name: "Die Cut",
        description: "Any shape you can imagine",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        color: "from-cyan-500 to-blue-500",
    },
    {
        id: 4,
        name: "Sticker Sheets",
        description: "Multiple designs per sheet",
        image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&h=400&fit=crop",
        color: "from-emerald-500 to-teal-500",
    },
];

// Trust badges data
const trustBadges = [
    { icon: Truck, title: "Free Shipping", desc: "On all US orders" },
    { icon: Shield, title: "Waterproof", desc: "Weather resistant" },
    { icon: Award, title: "Premium Quality", desc: "High-grade vinyl" },
    { icon: Zap, title: "Fast Turnaround", desc: "2-3 day production" },
];

function EcwidStoreContent() {
    const searchParams = useSearchParams();
    // Adding the '?' ensures it only calls .get if searchParams exists
    const searchQuery = searchParams?.get("search") || "";
    const [isLoading, setIsLoading] = useState(true);

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
      /* Custom Ecwid Styling to match brand */
      .ec-store {
        font-family: 'Roboto', sans-serif !important;
      }
      .ec-store .ec-price-item {
        color: ${coral} !important;
        font-weight: 600 !important;
      }
      .ec-store .ec-btn {
        background: linear-gradient(135deg, ${coral} 0%, #D02752 100%) !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 12px 24px !important;
      }
      .ec-store .ec-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 30px -10px ${coral}80 !important;
      }
      .ec-store .ec-product-tile:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important;
      }
    `;
        document.head.appendChild(style);

        // Initialize Ecwid configuration before loading the script
        if (!window.ec) {
            (window as any).ec = {};
        }
        (window as any).ec.config = {
            store_id: ECWID_STORE_ID,
            language: "en",
        };

        // Load and initialize Ecwid script
        const script1 = document.createElement("script");
        script1.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code&data_date=2025-11-28`;
        script1.setAttribute("data-cfasync", "false");
        script1.async = true;

        script1.onload = () => {
            const waitForEcwid = () => {
                if ((window as any).ec && (window as any).ec.ready) {
                    const script2 = document.createElement("script");
                    script2.type = "text/javascript";

                    let command = `xProductBrowser("categoriesPerRow=4","views=grid(20,4) list(60) table(60)","categoryView=grid","searchView=list"`;

                    if (searchQuery) {
                        command += `,"defaultSearch=${encodeURIComponent(searchQuery)}"`;
                    }

                    command += `,"id=my-store-${ECWID_STORE_ID}");`;
                    script2.textContent = command;
                    document.body.appendChild(script2);

                    setTimeout(() => {
                        const storeContainer = document.getElementById(
                            `my-store-${ECWID_STORE_ID}`
                        );
                        if (storeContainer) {
                            storeContainer.style.display = "block";
                            setIsLoading(false);
                        }
                    }, 500);
                } else {
                    setTimeout(waitForEcwid, 100);
                }
            };

            waitForEcwid();
        };

        script1.onerror = () => {
            console.error("Failed to load Ecwid script");
            setIsLoading(false);
        };

        document.body.appendChild(script1);

        return () => {
            if (script1.parentNode) {
                script1.parentNode.removeChild(script1);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Gradient */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(135deg, ${navy} 0%, #1a2d4a 50%, #2d3a5c 100%)`,
                    }}
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

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border"
                            style={{
                                background: `${coral}15`,
                                borderColor: `${coral}30`,
                            }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: coral }} />
                            <span
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: coral }}
                            >
                                Browse Collection
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Premium
                            <span
                                className="block mt-2"
                                style={{
                                    background: `linear-gradient(135deg, ${coral} 0%, #FF6B7A 50%, #8A244B 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Custom Stickers
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                            Discover our collection of high-quality, customizable stickers.
                            Perfect for brands, events, and personal expression.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const searchInput = (e.target as HTMLFormElement).elements.namedItem(
                                        "search"
                                    ) as HTMLInputElement;
                                    if (searchInput.value) {
                                        window.location.href = `/ecwid-store?search=${encodeURIComponent(
                                            searchInput.value
                                        )}`;
                                    }
                                }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search stickers..."
                                    defaultValue={searchQuery}
                                    className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all text-lg"
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                                        color: "white",
                                    }}
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
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
                </div>
            </section>

            {/* Featured Collections */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-xs font-semibold uppercase tracking-widest"
                            style={{
                                background: `${coral}10`,
                                borderColor: `${coral}20`,
                                color: coral,
                            }}
                        >
                            <Palette className="w-3 h-3" />
                            Collections
                        </span>
                        <h2
                            className="font-heading text-4xl sm:text-5xl font-bold mb-4"
                            style={{ color: navy }}
                        >
                            Shop by Category
                        </h2>
                        <p className="text-lg" style={{ color: "#64748b" }}>
                            Explore our premium sticker collections
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredCollections.map((collection) => (
                            <Link
                                key={collection.id}
                                href={`/ecwid-store?search=${encodeURIComponent(collection.name)}`}
                                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div
                                    className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-80`}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {collection.name}
                                    </h3>
                                    <p className="text-white/80 text-sm mb-3">
                                        {collection.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                                        <span>Shop Now</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {trustBadges.map((badge, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${coral}20 0%, ${coral}10 100%)`,
                                    }}
                                >
                                    <badge.icon
                                        className="w-6 h-6"
                                        style={{ color: coral }}
                                    />
                                </div>
                                <div>
                                    <h4
                                        className="font-semibold text-sm"
                                        style={{ color: navy }}
                                    >
                                        {badge.title}
                                    </h4>
                                    <p className="text-xs" style={{ color: "#64748b" }}>
                                        {badge.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Store Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <span
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-xs font-semibold uppercase tracking-widest"
                            style={{
                                background: `${coral}10`,
                                borderColor: `${coral}20`,
                                color: coral,
                            }}
                        >
                            <Sticker className="w-3 h-3" />
                            All Products
                        </span>
                        <h2
                            className="font-heading text-4xl sm:text-5xl font-bold mb-4"
                            style={{ color: navy }}
                        >
                            Browse Our Store
                        </h2>
                        <p className="text-lg" style={{ color: "#64748b" }}>
                            Find the perfect stickers for your needs
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                                style={{ borderColor: coral }}
                            />
                            <p style={{ color: "#64748b" }}>Loading products...</p>
                        </div>
                    )}

                    {/* Ecwid Store Container */}
                    <div
                        id={`my-store-${ECWID_STORE_ID}`}
                        className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"
                            }`}
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        className="relative rounded-[2.5rem] p-12 sm:p-16 overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${navy} 0%, #1e3a5f 100%)`,
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
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                style={{
                                    background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                                }}
                            >
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                                Can't Find What You Need?
                            </h2>
                            <p className="text-white/70 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                                Create fully custom stickers with your own designs. Our design
                                team is here to help bring your vision to life.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/product-page/00004"
                                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                                        boxShadow: `0 20px 40px -10px ${coral}50`,
                                    }}
                                >
                                    Create Custom Stickers
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/support"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function EcwidStore() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <EcwidStoreContent />
        </Suspense>
    );
}
