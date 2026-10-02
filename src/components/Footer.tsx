import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types/settings';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, siteSettings }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-2xl font-bold tracking-tight text-white">COWAY</span>
              <span className="text-xs font-semibold text-sky-400 tracking-wider">THAILAND</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm max-w-sm">
              {siteSettings?.siteTagline || 'ตัวแทนจำหน่ายผลิตภัณฑ์ Coway อย่างเป็นทางการ มุ่งมั่นส่งมอบน้ำดื่มสะอาดและอากาศบริสุทธิ์เพื่อสุขอนามัยที่ดีของทุกครัวเรือนไทย พร้อมบริการหลังการขาย Cody Heart Service ดูแลฟรีตลอดอายุสัญญา'}
            </p>
            <div className="flex items-center gap-2 text-slate-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>มาตรฐานรับรอง WQA Gold Seal & ฮาลาล (HALAL)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">เมนูลัด</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  หน้าแรก
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  สินค้าทั้งหมด
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  บริการ Cody Heart Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  คำนวณความคุ้มค่า
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  เกี่ยวกับเรา & รีวิว
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  สาระน่ารู้เพื่อสุขภาพ
                </button>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">หมวดหมู่สินค้า</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  เครื่องกรองน้ำ (Water Purifier)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  เครื่องฟอกอากาศ (Air Purifier)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ฝารองนั่งสุขภัณฑ์ (Smart Bidet)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ที่นอนเพื่อสุขภาพ (Hybrid Mattress)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Channels */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">ติดต่อเจ้าหน้าที่</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${siteSettings?.phoneNumber || '020000000'}`} className="hover:text-white transition-colors">
                  {siteSettings?.phoneDisplay || '02-000-0000'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={siteSettings?.lineUrl || "https://line.me"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LINE: {siteSettings?.lineId || '@cowaythailand'}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{siteSettings?.contactAddress || 'ให้บริการและติดตั้งฟรีครอบคลุม 77 จังหวัดทั่วประเทศไทย'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Coway Official Partner Thailand. สงวนลิขสิทธิ์ทั้งหมด
          </div>
          <div className="text-center md:text-right">
            เว็บไซต์นี้ดำเนินการโดยตัวแทนจำหน่ายอิสระที่ได้รับการแต่งตั้งอย่างถูกต้องจาก บริษัท โคเวย์ (ประเทศไทย) จำกัด
          </div>
        </div>
      </div>
    </footer>
  );
};
