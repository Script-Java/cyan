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
            <div className="flex gap-6 mt-8 pt-6 border-t border-gray-700">
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M15 11H13V19H11V11H9V9H11V7.5C11 5.6 12 4 14.3 4C15 4 15.6 4.1 16 4.2V6.4H14.8C14 6.4 13.8 6.8 13.8 7.5V9H16L15.5 11Z" fill="white" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24">
                  <path d="M21.5 7.5C21.2 6.4 20.4 5.5 19.3 5.3C17.4 5 12 5 12 5C12 5 6.6 5 4.7 5.3C3.6 5.5 2.8 6.4 2.5 7.5C2 9.4 2 13 2 13C2 13 2 16.6 2.5 18.5C2.8 19.6 3.6 20.5 4.7 20.7C6.6 21 12 21 12 21C12 21 17.4 21 19.3 20.7C20.4 20.5 21.2 19.6 21.5 18.5C22 16.6 22 13 22 13C22 13 22 9.4 21.5 7.5Z" fill="white" />
                  <path d="M10 16.5L16 13L10 9.5V16.5Z" fill="black" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M8 9C8 8.45 8.45 8 9 8C9.55 8 10 8.45 10 9C10 9.55 9.55 10 9 10C8.45 10 8 9.55 8 9Z" fill="white" />
                  <path d="M8 11H10V17H8V11Z" fill="white" />
                  <path d="M13 11V17H15V14C15 12.9 15.9 12 17 12C18.1 12 19 12.9 19 14V17H21V14C21 12.3 19.7 11 18 11C17.1 11 16.3 11.5 15.8 12.2V11H13Z" fill="white" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="white" viewBox="0 0 24 24">
                  <path d="M3.621 3.621L20.379 20.379M20.379 3.621L3.621 20.379" fill="none" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="white" />
                  <circle cx="12" cy="12" r="10" fill="none" />
                  <path d="M9 12.5C9 10.8 10.3 9.5 12 9.5C13.7 9.5 15 10.8 15 12.5C15 14.2 13.7 15.5 12 15.5C11 15.5 10.2 14.9 9.8 14.1" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" fill="white" viewBox="0 0 24 24">
                  <path d="M16 3H14C13.4 3 13 3.4 13 4V13C13 14.1 12.1 15 11 15C9.9 15 9 14.1 9 13V3H7V13C7 15.2 8.8 17 11 17C13.2 17 15 15.2 15 13V8.5C16 9.3 17.2 10 18.5 10V8C17 8 15.6 7.2 14.9 6V4C14.9 3.4 14.5 3 14 3M16 8V16C17.7 16 19 14.7 19 13V8C17.3 8 16 9.3 16 11" fill="white" />
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
