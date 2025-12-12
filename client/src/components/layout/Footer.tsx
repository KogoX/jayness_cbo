import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Brand & Motto */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Jayness CBO</h3>
            <p className="text-sm text-gray-500 italic">
              "Stronger Together"
            </p>
            <p className="text-sm text-gray-500">
              Empowering communities through healthcare, education, and economic inclusion.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-primary transition">
                  Dashboard Overview
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition">
                  Our Programs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition">
                  Events Calendar
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Legal */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span>📧</span> support@jaynesscbo.org
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +254 700 000 000
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {currentYear} Jayness Community Based Organization. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;