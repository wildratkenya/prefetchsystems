import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/699c6111136bd966ef67d342_1771935144580_898e7478.png';
const Footer: React.FC = () => {
  return <footer className="bg-[#0f1f38] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company */}
          <div>
            <img src={LOGO_URL} alt="Prefetch Systems" className="h-12 mb-4 brightness-200" />
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Certified & authorized CET dealers. We lease printers, photocopier toners, printer spares, and consumables for Konica Minolta and HP.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[{
              label: 'Home',
              path: '/'
            }, {
              label: 'Shop All Products',
              path: '/shop'
            }, {
              label: 'Konica Minolta Printers',
              path: '/collections/konica-minolta-printers'
            }, {
              label: 'HP Printers',
              path: '/collections/hp-printers'
            }, {
              label: 'CET Toners',
              path: '/collections/cet-toners-consumables'
            }, {
              label: 'Maintenance Kits',
              path: '/collections/maintenance-kits'
            }, {
              label: 'Contact Us',
              path: '/contact'
            }].map(link => <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span className="text-gray-400"><br />Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                <a href="tel:+254700000000" className="text-gray-400 hover:text-red-400 transition-colors">+254 722 998406</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                <a href="mailto:info@prefetchsystems.co.ke" className="text-gray-400 hover:text-red-400 transition-colors">info@prefetchsystems.co.ke</a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span className="text-gray-400">Mon - Fri: 8:00 AM - 6:00 PM<br />Sat: 9:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Payment & Newsletter */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">We Accept</h3>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded">M-PESA</div>
                <span className="text-sm text-gray-400">Lipa Na M-Pesa</span>
              </div>
              <p className="text-xs text-gray-500">Pay securely via M-Pesa STK Push</p>
            </div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Newsletter</h3>
            <form onSubmit={e => {
            e.preventDefault();
            alert('Subscribed!');
          }} className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500" data-mixed-content="true">&copy; {new Date().getFullYear()} Prefetch Systems. All rights reserved. Certified CET & Konica Minolta Dealers.</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/admin" className="hover:text-red-400 transition-colors">Admin Login</Link>
            <span>|</span>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;