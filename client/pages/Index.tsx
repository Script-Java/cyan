import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Index() {
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
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-black" style={{ margin: "-5px 0 -3px", padding: "20px 0 28px" }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1964px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl flex-shrink-0">📦</div>
                  <h3 className="font-semibold text-white">
                    <span className="block">Free ground shipping</span>
                    <span className="block text-white/60">on all orders</span>
                  </h3>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="text-4xl flex-shrink-0 animate-spin"
                    style={{ animationDuration: "4s" }}
                  >
                    🌍
                  </div>
                  <h3 className="font-semibold text-white">
                    <span className="block">Out for this world quality</span>
                    <span className="block text-white/60">
                      , made in the US
                    </span>
                  </h3>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl flex-shrink-0">🖼️</div>
                  <h3 className="font-semibold text-white">
                    <span className="block">Free Online Proof</span>
                    <span className="block text-white/60">with all orders</span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-black">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center relative rounded-3xl border border-white/10" style={{ maxWidth: "1156px", padding: "0 32px 28px", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 1px rgba(255, 255, 255, 0.1)" }}>
            <div className="absolute bg-white/5 rounded-2xl" style={{ opacity: 0.2, left: "-209px", top: "511px", width: "887px", bottom: "0px", right: "0px" }}>
              <div style={{ position: "absolute", top: "24px", left: "32px", fontSize: "18px" }}>⭐</div>
              <div style={{ position: "absolute", top: "16px", left: "25%", fontSize: "14px", color: "rgba(255, 255, 255, 0.8)" }}>✨</div>
              <div style={{ position: "absolute", top: "24px", right: "32px", fontSize: "14px", color: "rgba(150, 100, 200, 0.7)" }}>✨</div>
              <div style={{ position: "absolute", top: "50%", left: "24px", fontSize: "14px", color: "rgba(200, 150, 100, 0.7)" }}>⭐</div>
              <div style={{ position: "absolute", top: "50%", right: "24px", color: "rgba(150, 100, 150, 0.7)" }}>✨</div>
              <div style={{ position: "absolute", top: "33.3333%", left: "48px", fontSize: "12px", color: "rgba(180, 120, 60, 0.7)" }}>⭐</div>
              <div style={{ position: "absolute", top: "66.6667%", right: "48px", fontSize: "14px", color: "rgba(120, 180, 200, 0.7)" }}>✨</div>
              <div style={{ position: "absolute", bottom: "24px", left: "33.3333%", fontSize: "14px", color: "rgba(200, 180, 60, 0.8)" }}>✨</div>
              <div style={{ position: "absolute", bottom: "32px", left: "64px", fontSize: "12px", color: "rgba(100, 150, 200, 0.7)" }}>⭐</div>
              <div style={{ position: "absolute", bottom: "16px", right: "33.3333%", color: "rgba(255, 255, 255, 0.7)" }}>⭐</div>
              <div style={{ position: "absolute", bottom: "24px", right: "64px", fontSize: "14px", color: "rgba(150, 100, 200, 0.7)" }}>✨</div>
              <div style={{ position: "absolute", top: "48px", left: "50%", fontSize: "12px", color: "rgba(200, 150, 100, 0.7)" }}>⭐</div>
              <div style={{ position: "absolute", bottom: "48px", left: "50%", fontSize: "14px", color: "rgba(150, 100, 150, 0.7)" }}>✨</div>
            </div>
            <div className="relative z-10" style={{ marginBottom: "22px", paddingTop: "34px" }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Create?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Join thousands of customers who've created amazing custom stickers
              </p>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFD713",
                  borderColor: "#FFD713",
                  borderRadius: "8px",
                  borderWidth: "1px",
                  fontWeight: "700",
                  gap: "8px",
                  justifyContent: "center",
                  transitionDuration: "0.15s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  marginRight: "-1px",
                  padding: "16px 147px 18px 128px",
                  color: "#000000",
                }}
              >
                <a href="/login" style={{ textDecoration: "none", color: "inherit" }}>
                  Login
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white/60" style={{ marginBottom: "-4px", padding: "48px 0 200px" }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "2026px" }}>
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
          </div>
        </footer>
        <div style={{ fontWeight: "400", textAlign: "left", paddingBottom: "20px", paddingLeft: "32px", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
          Built with ❤️ by © Sticky Slap LLC
        </div>
      </main>
    </>
  );
}
