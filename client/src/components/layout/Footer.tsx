import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  minimal?: boolean;
}

const Footer: React.FC<FooterProps> = ({ minimal = false }) => {
  if (minimal) {
    return (
      <footer className="bg-gray-900 text-white py-6">
        <div className="px-4 md:px-8 lg:px-12 text-center text-gray-400 text-sm">
          <p>© 2026 Jayness Community Based Organization. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.svg" alt="Jayness Logo" loading="lazy" decoding="async" className="h-10 w-auto bg-white rounded-full p-1" />
            <span className="text-2xl font-bold">Jayness Foundation</span>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            Empowering communities through education, healthcare, and sustainable development. Join us in making a
            difference today.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Quick Links</h3>
          <ul className="space-y-3 text-gray-400">
            <li>
              <Link to="/" className="hover:text-primary transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/public/programs" className="hover:text-primary transition">
                Our Programs
              </Link>
            </li>
            <li>
              <Link to="/public/events" className="hover:text-primary transition">
                Events
              </Link>
            </li>
            <li>
              <Link to="/impact" className="hover:text-primary transition">
                Impact Stories
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Contact</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                123 Community Road,
                <br />
                Nairobi, Kenya
              </span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a2 2 0 011.9 1.37l1.06 3.18a2 2 0 01-.5 2.06L9.9 11.42a16 16 0 006.68 6.68l1.81-1.84a2 2 0 012.06-.5l3.18 1.06A2 2 0 0122 18.72V22a2 2 0 01-2 2h-1C9.61 24 0 14.39 0 3V2a2 2 0 012-2h1z"
                />
              </svg>
              <span>+254 700 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l9 6 9-6m0 8H3a2 2 0 01-2-2V8a2 2 0 012-2h18a2 2 0 012 2v6a2 2 0 01-2 2z"
                />
              </svg>
              <span>info@jayness-cbo.org</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 px-4 md:px-8 lg:px-12 text-center text-gray-500 text-sm">
        <p>© 2026 Jayness Community Based Organization. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
