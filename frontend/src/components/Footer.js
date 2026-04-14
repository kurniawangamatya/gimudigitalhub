import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#143D2E] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-heading font-semibold text-lg">Gimu Digital Hub</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Platform digital terpercaya untuk produk edukasi kedokteran dan kedokteran gigi.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-medium text-sm uppercase tracking-[0.2em] mb-4 text-white/80">Produk</h4>
            <ul className="space-y-3">
              <li><Link to="/products?category=ebook" className="text-sm text-white/60 hover:text-white transition-colors">E-Book</Link></li>
              <li><Link to="/products?category=video" className="text-sm text-white/60 hover:text-white transition-colors">Video Kursus</Link></li>
              <li><Link to="/products?category=template" className="text-sm text-white/60 hover:text-white transition-colors">Template</Link></li>
              <li><Link to="/products?category=quiz" className="text-sm text-white/60 hover:text-white transition-colors">Bank Soal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-medium text-sm uppercase tracking-[0.2em] mb-4 text-white/80">Informasi</h4>
            <ul className="space-y-3">
              <li><a href="/#about" className="text-sm text-white/60 hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="/#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimoni</a></li>
              <li><a href="/#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-medium text-sm uppercase tracking-[0.2em] mb-4 text-white/80">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="w-4 h-4" strokeWidth={1.5} /> info@gimudigitalhub.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Instagram className="w-4 h-4" strokeWidth={1.5} /> @gimudigitalhub
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4" strokeWidth={1.5} /> Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} Gimu Digital Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
