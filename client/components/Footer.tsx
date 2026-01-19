export default function Footer() {
  return (
    <footer
      className="bg-white text-gray-600 border-t border-gray-200 mt-auto"
      style={{ padding: "32px 0" }}
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "1100px" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
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
  );
}
