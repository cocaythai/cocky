import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Droplets,
  Sparkles,
  MessageCircle,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { SiteSettings } from '../types/settings';
import heroImgFallback from '../assets/images/hero_coway_kitchen_1790923059004.jpg';

interface HeroProps {
  onExploreProducts: () => void;
  onContactClick: () => void;
  siteSettings?: SiteSettings;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProducts,
  onContactClick,
  siteSettings,
}) => {
  const banners = siteSettings?.banners?.filter((b) => b.isActive) || [];
  const hasMultipleBanners = banners.length > 1;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide rotation if multiple banners
  useEffect(() => {
    if (!hasMultipleBanners) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [hasMultipleBanners, banners.length]);

  const activeBanner = banners[currentSlide] || banners[0];
  const heroImage = activeBanner?.imageUrl || heroImgFallback;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const heroBadge = siteSettings?.heroBadge || 'COWAY THAILAND · ตัวแทนจำหน่ายอย่างเป็นทางการ';
  const heroTitle = siteSettings?.heroTitle || 'ยกระดับคุณภาพชีวิต ด้วยน้ำดื่มบริสุทธิ์และอากาศสะอาดจาก Coway';
  const heroSubtitle =
    siteSettings?.heroSubtitle ||
    'บอกลาการแบกน้ำแพ็คและน้ำแข็งที่ไม่สะอาด ดื่มน้ำอุณหภูมิห้อง น้ำเย็นฉ่ำ น้ำร้อน และน้ำแข็งบริสุทธิ์ได้ไม่จำกัด ด้วยระบบ Coway Subscription เริ่มต้นเพียงวันละ 16 บาท ฟรีติดตั้งและดูแลตลอดสัญญา';

  return (
    <section id="hero" className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-700">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>{heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2] text-balance">
              {heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>

            {/* Value Proposition Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                <span>ฟรีค่าติดตั้งทั่วไทย 77 จังหวัด</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                <span>บริการ Cody ดูแลล้างถังฟรีทุก 2 เดือน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                <span>เปลี่ยนไส้กรองแท้ฟรีทุก 4 เดือน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                <span>รับประกันอะไหล่ฟรี 100% ตลอดอายุสัญญา</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={onExploreProducts}
                className="px-5 sm:px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer focus:outline-hidden"
              >
                <span>ดูสินค้าทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* สมัครตัวแทนขาย (ตำแหน่งที่ 2 ในส่วน Hero ด้านบนสุด) */}
              <a
                href={siteSettings?.agentLineUrl || siteSettings?.lineUrl || "https://line.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 text-sm font-bold text-amber-900 bg-linear-to-r from-amber-100 via-amber-200 to-amber-100 hover:from-amber-200 hover:to-amber-300 border border-amber-300/90 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer focus:outline-hidden"
                title="สมัครเป็นตัวแทนจำหน่าย Coway รายได้ดี มีเทรนนิ่งฟรี"
              >
                <UserCheck className="w-4 h-4 text-amber-800" />
                <span>สมัครตัวแทนขาย Coway</span>
              </a>

              <a
                href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
                className="px-5 py-3.5 text-sm font-bold text-white bg-black hover:bg-slate-800 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus:outline-hidden"
              >
                <PhoneCall className="w-4 h-4 text-white" />
                <span>โทร {siteSettings?.phoneDisplay || '02-000-0000'}</span>
              </a>

              <a
                href={siteSettings?.lineUrl || 'https://line.me'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-[#06c755] hover:bg-[#05b34c] rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>แอด LINE</span>
              </a>
            </div>

            {/* Trust Markers Bar */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="font-medium text-slate-700">WQA Gold Seal</span>
                <span>มาตรฐานน้ำดื่มโลก</span>
              </div>
              <span className="hidden sm:inline text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span className="font-medium text-slate-700">RO Membrane 0.0001 Micron</span>
              </div>
              <span className="hidden sm:inline text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="font-medium text-slate-700">อันดับ 1 ในเกาหลีและไทย</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset & Multi-Banner Slider */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
              <img
                src={heroImage}
                alt={activeBanner?.title || 'Coway Purifier'}
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[420px] lg:h-[480px] object-cover transition-all duration-700"
                decoding="async"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = heroImgFallback;
                }}
              />

              {/* Slider Controls if multiple banners */}
              {hasMultipleBanners && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="แบนเนอร์ก่อนหน้า"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="แบนเนอร์ถัดไป"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1.5 rounded-full z-10">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`ไปที่สไลด์ ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide ? 'w-5 bg-sky-400' : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Glassmorphism Banner Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider truncate">
                      {activeBanner?.title || 'โปรโมชั่นพิเศษประจำเดือน'}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 line-clamp-1">
                      {activeBanner?.subtitle || 'เริ่มต้นเพียง 490.- / เดือน ฟรีค่าติดตั้ง'}
                    </div>
                  </div>
                  <button
                    onClick={onExploreProducts}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-sky-600 rounded-xl transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {activeBanner?.buttonText || 'ดูโปรโมชั่น'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
