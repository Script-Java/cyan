"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sticker,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface LegalPageItem {
  id: string;
  title: string;
  page_type:
  | "privacy"
  | "terms"
  | "shipping"
  | "returns"
  | "legal"
  | "gdpr"
  | "ccpa";
}

const pageTypeLabels: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  shipping: "Shipping Policy",
  returns: "Return & Refund",
  legal: "Artwork & Ownership",
  gdpr: "GDPR Compliance",
  ccpa: "CCPA Rights",
};

const getPageTypeLabel = (pageType: string): string => {
  return pageTypeLabels[pageType] || pageType;
};

export default function Footer() {
  const [legalPages, setLegalPages] = useState<LegalPageItem[]>([]);
  const currentYear = new Date().getFullYear();

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

  const footerLinks = {
    shop: [
      { label: "All Products", href: "/ecwid-store" },
      { label: "Custom Stickers", href: "/product-page/00004" },
      { label: "Deals", href: "/deals" },
      { label: "Gift Cards", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Journal", href: "/blogs" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "/support" },
      { label: "Track Order", href: "/order-status" },
      { label: "Contact Us", href: "/support" },
      { label: "FAQ", href: "#faq" },
    ],
    account: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Order History", href: "/order-history" },
      { label: "My Designs", href: "/designs" },
      { label: "Settings", href: "/account-settings" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/stickerlandco", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const coral = "#F63049";
  const navy = "#111F35";

  return (
    <footer style={{ background: navy }} className="text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${coral} 0%, #D02752 50%, #8A244B 100%)`,
                  boxShadow: `0 10px 30px -10px ${coral}50`
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold tracking-tight">
                  Stickerland
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.3em] font-semibold"
                  style={{ color: coral }}
                >
                  Premium Stickers
                </span>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Elevating brands and personal expression through premium custom stickers
              since 2020.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:sticky@stickerland.com"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#F63049] transition-colors"
              >
                <Mail className="w-4 h-4" />
                sticky@stickerland.com
              </a>
              <p className="flex items-center gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4" />
                Los Angeles, CA
              </p>
              <p className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4" />
                Mon-Fri: 10am-5pm
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Legal */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-display text-lg font-semibold mb-4 mt-8">Legal</h3>
            <ul className="space-y-3">
              {legalPages.length > 0 ? (
                legalPages.slice(0, 3).map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/legal/${page.page_type}`}
                      className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                    >
                      {getPageTypeLabel(page.page_type)}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/legal/privacy"
                      className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                    >
                      Privacy Policy
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/terms"
                      className="text-sm text-white/60 hover:text-[#F63049] transition-colors inline-flex items-center gap-1 group"
                    >
                      Terms of Service
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-16 border-t border-white/10">
          <div className="max-w-2xl">
            <h3 className="font-display text-2xl font-semibold mb-3">
              Stay in the Loop
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Subscribe to our newsletter for exclusive deals, design inspiration, and sticker tips.
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none transition-colors"
              // style={{ focusBorderColor: "#F63049" }} // Removed invalid style
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #F63049 0%, #D02752 100%)",
                  boxShadow: "0 10px 25px -5px rgba(246, 48, 73, 0.4)"
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              {currentYear} Stickerland. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#F63049] hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
