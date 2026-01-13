import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* 1. BRAND & LOGO SECTION */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            {/* Logo Image */}
            <img src="/logo.png" alt="Jayness Logo" className="h-10 w-auto bg-white rounded-full p-1" />
            <span className="text-2xl font-bold">Jayness CBO</span>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            Empowering communities through education, healthcare, and sustainable development. 
            Join us in making a difference today.
          </p>
        </div>

        {/* 2. QUICK LINKS */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Quick Links</h3>
          <ul className="space-y-3 text-gray-400">
            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
            <li><Link to="/programs" className="hover:text-primary transition">Our Programs</Link></li>
            <li><Link to="/impact" className="hover:text-primary transition">Impact Stories</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* 3. CONTACT INFO */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Contact</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="mt-1">📍</span>
              <span>123 Community Road,<br/>Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-3">
              <span>📞</span>
              <span>+254 700 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <span>✉️</span>
              <span>info@jayness-cbo.org</span>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Jayness Community Based Organization. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;