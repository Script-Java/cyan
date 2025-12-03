import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Index() {
  const stickerTypes = [
    {
      name: "Vinyl Stickers",
      description: "Durable, waterproof stickers",
      emoji: "✨",
      color: "from-green-400 to-emerald-600",
    },
    {
      name: "Holographic Stickers",
      description: "Shimmering iridescent finish",
      emoji: "🌈",
      color: "from-purple-400 to-pink-600",
    },
    {
      name: "Chrome Stickers",
      description: "Metallic mirror effect",
      emoji: "💎",
      color: "from-gray-200 to-gray-400",
    },
    {
      name: "Glitter Stickers",
      description: "Sparkly, eye-catching designs",
      emoji: "⭐",
      color: "from-blue-400 to-cyan-600",
    },
  ];

  const features = [
    {
      icon: "🎨",
      title: "Custom Design",
      description: "Upload your own designs or work with our creators",
    },
    {
      icon: "⚡",
      title: "Fast Delivery",
      description: "Get your stickers shipped in 3-5 business days",
    },
    {
      icon: "💰",
      title: "Best Prices",
      description: "Competitive pricing with bulk discounts available",
    },
    {
      icon: "🛡️",
      title: "Quality Guaranteed",
      description: "Premium materials and expert printing",
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20 bg-black text-white min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-black text-white overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#FFD713]" />
                <span className="text-sm font-medium">
                  Premium Custom Stickers
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Design Your Own
                <span className="block bg-gradient-to-r from-[#FFD713] to-[#FFA500] bg-clip-text text-transparent">
                  Custom Stickers
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed">
                Express yourself with high-quality, custom stickers. Perfect for
                laptops, water bottles, walls, and more. Fast shipping, amazing
                designs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/ecwid-store"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transition-all"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#sticker-types"
                  className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Explore Stickers
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-black border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose StickerHub?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-black border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Create?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of customers who've created amazing custom stickers
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white/60 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-white mb-4">Shop</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Vinyl Stickers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Holographic
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Chrome
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Glitter
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Shipping
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Returns
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Follow</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-sm">
              <p>&copy; 2024 StickerHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
