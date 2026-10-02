import React from 'react';
import { COWAY_FAQS } from '../data/cowayProducts';
import { DEFAULT_CUSTOMER_REVIEWS, CustomerReviewItem } from '../data/defaultReviews';
import { SiteSettings } from '../types/settings';
import { ShieldCheck, Award, Star, CheckCircle, Truck, HeartHandshake, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  siteSettings?: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteSettings }) => {
  const reviews: CustomerReviewItem[] = siteSettings?.customerReviews && siteSettings.customerReviews.length > 0
    ? siteSettings.customerReviews.filter(r => r.isActive !== false)
    : DEFAULT_CUSTOMER_REVIEWS.filter(r => r.isActive !== false);

  return (
    <section id="about" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2">
            ABOUT US · ตัวแทนจำหน่ายอย่างเป็นทางการ
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            ส่งมอบน้ำดื่มสะอาดและอากาศบริสุทธิ์ สู่ทุกครอบครัวไทย
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            เราคือทีมงานตัวแทนจำหน่ายอย่างเป็นทางการของ บริษัท โคเวย์ (ประเทศไทย) จำกัด มุ่งมั่นให้คำปรึกษาและบริการอย่างจริงใจ ช่วยให้คุณและครอบครัวได้ดื่มน้ำที่สะอาด ปลอดภัย ไร้กังวล ในงบประมาณที่คุ้มค่าที่สุด
          </p>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">แบรนด์อันดับ 1 จากเกาหลี</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Coway มียอดขายและสมาชิกผู้ใช้งานมากที่สุดในประเทศเกาหลีใต้ และขยายความนิยมสูงสุดในประเทศไทย
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">ติดตั้งฟรี 77 จังหวัด</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ครอบคลุมทุกพื้นที่ทั่วไทย ทีมช่างมืออาชีพพร้อมเดินทางเข้าติดตั้งและดูแลถึงหน้าบ้านคุณภายใน 1-3 วัน
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cody ดูแลฟรีตลอดสัญญา</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              บริการล้างถังทุก 2 เดือน และเปลี่ยนไส้กรองทุก 4 เดือน ไม่ต้องจำวันเปลี่ยนเพราะเรานัดหมายล่วงหน้าให้
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">มาตรฐานระดับสากล</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ได้รับการรับรอง WQA Gold Seal, NSF, ฮาลาล และชนะรางวัลการออกแบบระดับโลก iF & Red Dot
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div id="reviews" className="mb-16">
            <div className="max-w-2xl mb-8">
              <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                REVIEWS · เสียงตอบรับจากผู้ใช้จริง
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                ความประทับใจจากลูกค้า Coway ทั่วประเทศ
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.customerName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                          {rev.customerName.charAt(0) || 'C'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{rev.customerName}</span>
                          {rev.verified !== false && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{rev.location}</div>
                      </div>
                    </div>
                    {rev.productName && (
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                          รุ่น {rev.productName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>คำถามที่พบบ่อย (FAQs)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              ข้อสงสัยเกี่ยวกับการสมัคร Coway Subscription
            </h3>
          </div>

          <div className="space-y-4">
            {COWAY_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group border border-slate-200/80 rounded-2xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-slate-900 text-sm sm:text-base">
                  <span>{faq.question}</span>
                  <span className="shrink-0 rounded-full bg-white p-1.5 text-slate-900 shadow-2xs group-open:-rotate-180 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>

                <p className="mt-4 leading-relaxed text-xs sm:text-sm text-slate-600 border-t border-slate-200/60 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
