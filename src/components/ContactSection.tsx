import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2, ShieldCheck, Mail, Sparkles, UserCheck } from 'lucide-react';
import { ConsultationForm } from '../types';
import { SiteSettings } from '../types/settings';

interface ContactSectionProps {
  siteSettings?: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  const [formData, setFormData] = useState<ConsultationForm>({
    fullName: '',
    phoneNumber: '',
    lineId: '',
    province: 'กรุงเทพมหานคร',
    interestedCategory: 'เครื่องกรองน้ำ',
    paymentPreference: 'subscription',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const provinces = [
    'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ชลบุรี', 'เชียงใหม่',
    'นครราชสีมา', 'ขอนแก่น', 'ภูเก็ต', 'สงขลา', 'สุราษฎร์ธานี', 'ระยอง', 'พระนครศรีอยุธยา',
    'เชียงราย', 'พิษณุโลก', 'นครสวรรค์', 'อุบลราชธานี', 'อุดรธานี', 'จังหวัดอื่นๆ ทั่วประเทศ'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber) return;

    setLoading(true);
    // Simulate instant responsive submission (in future maps directly to Supabase table)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      phoneNumber: '',
      lineId: '',
      province: 'กรุงเทพมหานคร',
      interestedCategory: 'เครื่องกรองน้ำ',
      paymentPreference: 'subscription',
      notes: '',
    });
  };

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

        {/* 2-Column Layout: Direct Contact Info & Consultation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Direct Contact Info & Service Area */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Cards */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-5">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                ช่องทางติดต่อด่วน
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Phone */}
                <a
                  href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
                  className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200/60 hover:border-sky-300 transition-colors group"
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
                  className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-300 transition-colors group"
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
                  className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200/60 hover:border-blue-300 transition-colors group"
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

            {/* Agent Recruitment Highlight Card */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <span>ร่วมงานกับเรา · สมัครตัวแทนขาย Coway</span>
                </div>
                <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  รับสมัคร
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                สร้างรายได้เสริมหรือรายได้หลักกับแบรนด์อันดับ 1 มีทีมพี่เลี้ยงเทรนนิ่งฟรี ไม่ต้องสต็อกสินค้า ทำงานได้ทุกที่
              </p>
              <a
                href={siteSettings?.agentLineUrl || siteSettings?.lineUrl || "https://line.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4 text-amber-100" />
                <span>สมัครตัวแทนขายผ่าน LINE ทันที</span>
              </a>
            </div>

            {/* Service Coverage Box */}
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 space-y-3">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-sm sm:text-base">
                <MapPin className="w-5 h-5 text-sky-600" />
                <span>พื้นที่ให้บริการครอบคลุมทั่วประเทศ</span>
              </div>
              <p className="text-xs text-sky-900/80 leading-relaxed">
                {siteSettings?.contactAddress || 'เรามีทีมช่างและ Cody กระจายอยู่ครบทุกศูนย์บริการใน 77 จังหวัดทั่วไทย พร้อมบริการติดตั้งฟรีและดูแลฟรีถึงหน้าบ้าน'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-sky-700">
                <Clock className="w-4 h-4" />
                <span>เวลาทำการ: {siteSettings?.contactHours || 'จันทร์ - อาทิตย์ 08:30 - 20:00 น.'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Consultation Form */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80">
            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  ส่งข้อมูลเรียบร้อยแล้ว!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  ขอบคุณที่ให้ความสนใจผลิตภัณฑ์ Coway เจ้าหน้าที่ผู้เชี่ยวชาญจะติดต่อกลับตามหมายเลข <strong className="text-slate-900 font-mono">{formData.phoneNumber}</strong> ภายใน 15-30 นาที เพื่อแจ้งโปรโมชั่นพิเศษและนัดหมายวันติดตั้งครับ
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    ส่งข้อมูลเพิ่มเติมอีกครั้ง
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    ลงทะเบียนรับสิทธิ์โปรโมชั่นและให้เจ้าหน้าที่ติดต่อกลับ
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    กรอกข้อมูลเพื่อให้เราติดต่อกลับพร้อมข้อเสนอพิเศษและเช็กคิวติดตั้งฟรี
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 081-234-5678"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LINE ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      LINE ID (สำหรับส่งใบเสนอราคา)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น coway_user"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  {/* Province */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      จังหวัดที่ต้องการติดตั้ง
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 cursor-pointer"
                    >
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Interested Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      สินค้าที่สนใจ
                    </label>
                    <select
                      value={formData.interestedCategory}
                      onChange={(e) => setFormData({ ...formData, interestedCategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 cursor-pointer"
                    >
                      <option value="เครื่องกรองน้ำ">เครื่องกรองน้ำ (Water Purifier)</option>
                      <option value="เครื่องฟอกอากาศ">เครื่องฟอกอากาศ (Air Purifier)</option>
                      <option value="ฝารองนั่งสุขภัณฑ์">ฝารองนั่งสุขภัณฑ์อัจฉริยะ (Bidet)</option>
                      <option value="ที่นอนและเตียง">ที่นอนเพื่อสุขภาพ (Mattress)</option>
                      <option value="สนใจแพ็กเกจคู่">แพ็กเกจคู่ กรองน้ำ + ฟอกอากาศ</option>
                    </select>
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      รูปแบบที่ต้องการ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentPreference: 'subscription' })}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                          formData.paymentPreference === 'subscription'
                            ? 'bg-sky-50 text-sky-700 border-sky-400 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        รายเดือน Subscription
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentPreference: 'cash' })}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                          formData.paymentPreference === 'cash'
                            ? 'bg-sky-50 text-sky-700 border-sky-400 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        ซื้อสด (ก้อนเดียว)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ข้อความเพิ่มเติม / รุ่นที่เล็งไว้ (ถ้ามี)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น สนใจรุ่น Neo Plus อยากได้คิวติดตั้งวันเสาร์นี้ หรือมีสมาชิกในบ้าน 4 คน..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>กำลังส่งข้อมูล...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ขอรับสิทธิ์โปรโมชั่นและนัดหมาย</span>
                      </>
                    )}
                  </button>
                  <div className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เฉพาะการติดต่อจาก Coway เท่านั้น</span>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
