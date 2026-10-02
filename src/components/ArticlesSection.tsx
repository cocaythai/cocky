import React, { useState } from 'react';
import { BookOpen, HeartPulse, Lightbulb, Clock, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

import imgHealthWater from '../assets/images/health_water_ro_1790957089308.jpg';
import imgHealthAir from '../assets/images/health_air_pm25_1790957100930.jpg';
import imgTipFilterCare from '../assets/images/tip_filter_care_1790957114545.jpg';
import imgTipChoosePurifier from '../assets/images/tip_choose_purifier_1790957131880.jpg';

export interface ArticleItem {
  id: string;
  category: 'health' | 'tip';
  categoryLabel: string;
  title: string;
  summary: string;
  content: string[];
  image: string;
  readTime: string;
  date: string;
  tags: string[];
}

export const ARTICLES_DATA: ArticleItem[] = [
  // --- บทความสุขภาพ (2 บทความ) ---
  {
    id: 'health-1',
    category: 'health',
    categoryLabel: 'บทความสุขภาพ',
    title: '5 ประโยชน์ของการดื่มน้ำบริสุทธิ์ระบบ RO ต่อสุขภาพร่างกาย',
    summary: 'น้ำสะอาดบริสุทธิ์ไร้สารตกค้าง ช่วยกระตุ้นระบบเผาผลาญ ลดการทำงานของไต และช่วยให้เซลล์ในร่างกายสดชื่นเปล่งปลั่ง',
    content: [
      'น้ำบริสุทธิ์ที่ผ่านการกรองระบบ Reverse Osmosis (RO) มีความละเอียดในการกรองสูงถึง 0.0001 ไมครอน ซึ่งสามารถกรองโลหะหนัก เชื้อไวรัส แบคทีเรีย สารเคมีปนเปื้อน และ microplastics ออกได้อย่างสมบูรณ์',
      '1. ลดภาระการทำงานของไต: การดื่มน้ำบริสุทธิ์ที่ไร้สารตกค้างช่วยให้ไตไม่ต้องทำงานหนักในการกรองสารแปลกปลอมออกจากร่างกาย',
      '2. ป้องกันการสะสมของโลหะหนัก: ตะกั่ว ปรอท และสารแคดเมียมในน้ำประปาเก่าอาจสะสมในร่างกายระยะยาว การกรอง RO ช่วยขจัดความเสี่ยงนี้ได้ 100%',
      '3. ดูดซึมเร็ว สดชื่นทันที: โมเลกุลน้ำบริสุทธิ์สามารถเข้าสู่เซลล์และระบบเลือดได้รวดเร็ว ช่วยเพิ่มความสดชื่นและปรับสมดุลความดันโลหะ',
      '4. สุขภาพผิวพรรณดีขึ้น: การดื่มน้ำบริสุทธิ์เพียงพอวันละ 2-3 ลิตร ช่วยให้ผิวพรรณชุ่มชื้น ขับของเสียทางเหงื่อและปัสสาวะได้อย่างมีประสิทธิภาพ',
      '5. ปลอดภัยสำหรับเด็กเล็กและผู้สูงอายุ: น้ำ RO เหมาะอย่างยิ่งสำหรับการนำไปต้มชงนมเด็ก หรือให้ผู้ป่วยและผู้สูงอายุรับประทานโดยไม่มีผลข้างเคียง'
    ],
    image: imgHealthWater,
    readTime: '3 นาที',
    date: '1 ตุลาคม 2569',
    tags: ['น้ำดื่ม RO', 'สุขภาพไต', 'ดูแลร่างกาย'],
  },
  {
    id: 'health-2',
    category: 'health',
    categoryLabel: 'บทความสุขภาพ',
    title: 'ปกป้องปอดคนในบ้านจากฝุ่น PM2.5 และสารก่อภูมิแพ้ด้วยเครื่องฟอกอากาศ',
    summary: 'ฝุ่น PM2.5 และเกสรดอกไม้ ละอองฝุ่นในอากาศอาจก่อให้เกิดโรคทางเดินหายใจเรื้อรัง มารู้จักวิธีสร้างอากาศบริสุทธิ์ในบ้านกัน',
    content: [
      'ฝุ่นละอองขนาดเล็กไม่เกิน 2.5 ไมครอน (PM2.5) สามารถหลุดรอดผ่านขนจมูกเข้าสู่ถุงลมปอดและกระแสเลือดได้อย่างง่ายดาย ก่อให้เกิดอาการระคายเคือง ภูมิแพ้กำเริบ และส่งผลเสียต่อระบบหัวใจ',
      'แผ่นกรอง HEPA ระดับพรีเมียมในเครื่องฟอกอากาศ Coway สามารถดักจับอนุภาคขนาดเล็กถึง 0.01 ไมครอน ได้สูงถึง 99.999% รวมถึงไวรัส ไรฝุ่น และสปอร์เชื้อรา',
      'การตั้งเครื่องฟอกอากาศในห้องนอนและห้องห้องรับแขกที่สมาชิกในบ้านใช้งานบ่อยที่สุด จะช่วยลดการสะสมของสารก่อภูมิแพ้ ช่วยให้หลับสนิท ร่างกายฟื้นฟูเต็มที่ตลอดคืน',
      'คำแนะนำเพิ่มเติม: ควรเปลี่ยนไส้กรอง HEPA ตามรอบเวลาอย่างสม่ำเสมอ เพื่อคงประสิทธิภาพการฟอกอากาศให้อยู่ในระดับสูงสุดตลอดเวลา'
    ],
    image: imgHealthAir,
    readTime: '4 นาที',
    date: '28 กันยายน 2569',
    tags: ['PM2.5', 'เครื่องฟอกอากาศ', 'ภูมิแพ้'],
  },

  // --- สาระน่ารู้ (2 บทความ) ---
  {
    id: 'tip-1',
    category: 'tip',
    categoryLabel: 'สาระน่ารู้',
    title: 'ไขข้อข้องใจ: ทำไมต้องเปลี่ยนไส้กรองเครื่องกรองน้ำตามกำหนดเวลา?',
    summary: 'ไส้กรองที่หมดอายุการใช้งานอาจกลายเป็นแหล่งสะสมของแบคทีเรีย เรียนรู้วิธีดูแลเครื่องกรองน้ำให้สะอาดเหมือนใหม่เสมอ',
    content: [
      'หลายคนอาจคิดว่าตราบใดที่น้ำยังไหลแรงอยู่ เครื่องกรองน้ำก็ยังทำงานได้ดี แต่ความจริงแล้วไส้กรองมีอายุการดักจับตะกอนและเคมีภัณฑ์ที่จำกัด',
      'เมื่อไส้กรองตะกอน (Neo-Sense) อุดตัน แรงดันน้ำจะตก และสารคลอรีนอาจหลุดรอดไปทำลายแผ่นกรอง RO Membrane ทำให้แผ่นกรองเสื่อมสภาพเร็วกว่าปกติ',
      'ไส้กรองที่ใช้เกินกำหนดเวลาอาจสะสมเชื้อจุลินทรีย์จนกลายเป็นแหล่งปนเปื้อนในถังเก็บน้ำ ดังนั้น การมีบริการ Coway Cody เข้าเปลี่ยนไส้กรองแท้ฟรีทุก 4 เดือน จึงช่วยรับประกันความสะอาดและประหยัดค่าใช้จ่ายได้สูงสุด'
    ],
    image: imgTipFilterCare,
    readTime: '3 นาที',
    date: '25 กันยายน 2569',
    tags: ['ดูแลไส้กรอง', 'Cody Service', 'ความรู้เครื่องกรองน้ำ'],
  },
  {
    id: 'tip-2',
    category: 'tip',
    categoryLabel: 'สาระน่ารู้',
    title: 'เทคนิคการเลือกซื้อเครื่องกรองน้ำให้ตอบโจทย์จำนวนสมาชิกในครอบครัว',
    summary: 'เลือกขนาดถังและฟังก์ชันน้ำร้อน-เย็น-ไอซ์ให้คุ้มค่า เหมาะสมกับความต้องการใช้งานจริงในแต่ละวัน',
    content: [
      'การเลือกเครื่องกรองน้ำไม่ได้ดูแค่ความสวยงาม แต่ต้องคำนึงถึงความจุถังน้ำ (Tank Capacity) และพฤติกรรมการดื่มน้ำของสมาชิกในบ้าน',
      '1. สมาชิก 1-3 คน (คอนโด/บ้านขนาดเล็ก): แนะนำรุ่นขนาดกะทัดรัด เช่น Coway Cinnamon หรือ Coway Neo Plus ที่มีถังน้ำ 5.0 - 5.8 ลิตร ผลิตน้ำใหม่รวดเร็ว',
      '2. สมาชิก 4-6 คน (ครอบครัวใหญ่/โฮมออฟฟิศ): แนะนำรุ่น Villaem II หรือ Core ที่มีความจุถังน้ำใหญ่ขึ้น 11.3 - 21.1 ลิตร รองรับการกดน้ำต่อเนื่อง',
      '3. คนชอบดื่มน้ำเย็น/กาแฟ/น้ำแข็ง: แนะนำรุ่น My Ice ที่มีช่องทำน้ำแข็งบริสุทธิ์ในตัว สะดวก สบาย ไม่ต้องทำน้ำแข็งเอง'
    ],
    image: imgTipChoosePurifier,
    readTime: '3 นาที',
    date: '20 กันยายน 2569',
    tags: ['เลือกเครื่องกรองน้ำ', 'คู่มือซื้อ', 'Coway'],
  },
];

export const ArticlesSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const healthArticles = ARTICLES_DATA.filter((a) => a.category === 'health');
  const tipArticles = ARTICLES_DATA.filter((a) => a.category === 'tip');

  return (
    <section id="articles" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>KNOWLEDGE & HEALTH · คลังความรู้และสุขภาพ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            บทความสุขภาพ & สาระน่ารู้
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            สาระดีๆ เพื่อการดูแลสุขภาพของคนในครอบครัว เคล็ดลับการเลือกใช้ผลิตภัณฑ์ และเกร็ดความรู้เรื่องน้ำดื่มบริสุทธิ์
          </p>
        </div>

        {/* 1. บทความสุขภาพ (Health Articles - 2 Items) */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h3 className="text-xl font-bold text-slate-900">
              บทความสุขภาพ
            </h3>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
              2 บทความไฮไลท์
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {healthArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={art.image}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {art.categoryLabel}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{art.readTime}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{art.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-sky-600 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100/80 mt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {art.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>อ่านต่อ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. สาระน่ารู้ (Knowledge Tips - 2 Items) */}
        <div>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">
              สาระน่ารู้
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              2 บทความไฮไลท์
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tipArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={art.image}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {art.categoryLabel}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{art.readTime}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{art.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-amber-600 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100/80 mt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {art.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>อ่านต่อ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-80 bg-slate-900">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedArticle.categoryLabel}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>{selectedArticle.date}</span>
                <span>·</span>
                <span>เวลาอ่าน {selectedArticle.readTime}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h3>

              <div className="p-4 bg-sky-50 rounded-2xl text-xs sm:text-sm text-sky-900 font-medium leading-relaxed border border-sky-100">
                {selectedArticle.summary}
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
                {selectedArticle.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.tags.map((tag) => (
                    <span key={tag} className="text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
