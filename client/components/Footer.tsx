import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) {
      setMessage('Please enter an email and accept the consent');
      return;
    }
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage('Thanks for subscribing!');
        setEmail('');
        setConsent(false);
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Newsletter Section */}
        <div className="bg-gray-900 text-white p-8 sm:p-12">
          <div className="max-w-md">
            <h3 className="text-lg font-bold mb-2">Stay connected with Sticky Slap</h3>
            <p className="text-sm text-gray-300 mb-6">
              Sign up to our email list for insider deals, tips and inspiration.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-400 bg-white text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer"
                  required
                />
                <label htmlFor="consent" className="text-xs text-gray-300 cursor-pointer">
                  I consent that Sticky Slap LLC may process my personal data for the purpose of direct marketing. I can unsubscribe anytime via link in email and read details in our Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
              >
                SUBSCRIBE
              </button>

              {message && (
                <p className="text-xs text-yellow-300">{message}</p>
              )}
            </form>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm4.846-10.424c-.795 0-1.44-.645-1.44-1.44s.645-1.44 1.44-1.44 1.438.645 1.438 1.44-.643 1.44-1.438 1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.856.973v1.237h-.001c-.676-.67-1.606-1.089-2.637-1.089-2.5 0-4.5 2.04-4.5 4.5 0 .34.034.678.1 1.022-3.728-.221-7.123-1.971-9.359-4.646-.39.67-.609 1.45-.609 2.28 0 1.56.8 2.94 2.022 3.756-.746-.025-1.476-.228-2.1-.567v.057c0 2.18 1.551 4.001 3.605 4.422-.377.103-.771.16-1.175.16-.287 0-.568-.028-.842-.082.593 1.85 2.323 3.196 4.368 3.233-1.537 1.206-3.475 1.927-5.578 1.927-.363 0-.719-.021-1.068-.063 2.036 1.306 4.455 2.064 7.029 2.064 8.436 0 13.034-6.993 13.034-13.034 0-.199-.005-.397-.014-.596.894-.645 1.671-1.453 2.282-2.372z" />
                </svg>
              </a>
              <a
                href="#"
                className="hover:text-yellow-400 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.498 3.75H15.75V2.25a.75.75 0 00-1.5 0v1.5h-4.5V2.25a.75.75 0 00-1.5 0v1.5H2.25a.75.75 0 00-.75.75v16.5a.75.75 0 00.75.75h17.25a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75zm-.75 16.5H3v-15h15.75v15zM8.25 8.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm-6 3a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm-6 3a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm3 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white text-gray-600 p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-600">
        <p>© Sticky Slap LLC. 2026</p>
      </div>
    </footer>
  );
}
