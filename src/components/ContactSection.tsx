import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, Mail, UserCheck } from 'lucide-react';
import { SiteSettings } from '../types/settings';

interface ContactSectionProps {
  siteSettings?: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2">
            CONTACT US · ปรึกษาผู้เชี่ยวชาญ Coway
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            {siteSettings?.contactHeading || 'ติดต่อสอบถามโปรโมชั่นและนัดหมายติดตั้ง'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {siteSettings?.contactSubtitle || 'ทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษา แนะนำรุ่นที่คุ้มค่าที่สุด และนัดหมายช่างติดตั้งฟรีถึงบ้านคุณ'}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Quick Contact Cards */}
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-4">
                ช่องทางติดต่อด่วน
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Phone */}
                <a
                  href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
                  className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-slate-200/60 hover:border-sky-300 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">โทรสายด่วน ({siteSettings?.contactHours || 'ทุกวัน 08.30 - 20.00 น.'})</div>
                    <div className="font-bold text-slate-900 text-base group-hover:text-sky-600">
                      {siteSettings?.phoneDisplay || '02-000-0000'}
                    </div>
                  </div>
                </a>

                {/* LINE OA */}
                <a
                  href={siteSettings?.lineUrl || "https://line.me"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-300 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">LINE Official Account</div>
                    <div className="font-bold text-emerald-600 text-base">
                      {siteSettings?.lineId || '@cowaythailand'}
                    </div>
                  </div>
                </a>

                {/* Facebook */}
                <a
                  href={siteSettings?.facebookUrl || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-slate-200/60 hover:border-blue-300 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Facebook Page</div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-600">
                      {siteSettings?.facebookName || siteSettings?.siteName || 'Coway Thailand Authorized Partner'}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Agent Recruitment Highlight Card */}
          <div className="bg-linear-to-br from-amber-50 to-orange-50 p-6 sm:p-8 rounded-3xl border border-amber-200/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-base">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <span>ร่วมงานกับเรา · สมัครตัวแทนขาย Coway</span>
                </div>
                <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md">
                  รับสมัคร
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                สร้างรายได้เสริมหรือรายได้หลักกับแบรนด์อันดับ 1 มีทีมพี่เลี้ยงเทรนนิ่งฟรี ไม่ต้องสต็อกสินค้า ทำงานได้ทุกที่
              </p>
            </div>
            <a
              href={siteSettings?.agentLineUrl || siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 text-amber-100" />
              <span>สมัครตัวแทนขายผ่าน LINE ทันที</span>
            </a>
          </div>

          {/* Service Coverage Box */}
          <div className="bg-sky-50 p-6 sm:p-8 rounded-3xl border border-sky-100 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
                <MapPin className="w-5 h-5 text-sky-600" />
                <span>พื้นที่ให้บริการครอบคลุมทั่วประเทศ</span>
              </div>
              <p className="text-xs sm:text-sm text-sky-900/80 leading-relaxed">
                {siteSettings?.contactAddress || 'เรามีทีมช่างและ Cody กระจายอยู่ครบทุกศูนย์บริการใน 77 จังหวัดทั่วไทย พร้อมบริการติดตั้งฟรีและดูแลฟรีถึงหน้าบ้าน'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-sky-700 bg-white/80 p-3.5 rounded-2xl border border-sky-100/80">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <span>เวลาทำการ: {siteSettings?.contactHours || 'จันทร์ - อาทิตย์ 08:30 - 20:00 น.'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
