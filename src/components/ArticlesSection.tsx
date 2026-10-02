import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Droplets, 
  Wind, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Clock, 
  HeartHandshake, 
  TrendingDown, 
  FileText,
  X
} from 'lucide-react';
import { SiteSettings } from '../types/settings';

interface Article {
  id: string;
  title: string;
  category: 'water' | 'health' | 'service' | 'air';
  categoryLabel: string;
  summary: string;
  readTime: string;
  date: string;
  imageUrl: string;
  keyPoints: string[];
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'why-coway-subscription',
    title: 'ทำไมคนรุ่นใหม่ถึงเปลี่ยนจาก "น้ำขวดแพ็ค" มาใช้ระบบ Subscription ของ Coway?',
    category: 'water',
    categoryLabel: 'ความคุ้มค่า & ไลฟ์สไตล์',
    summary: 'เปรียบเทียบชัดเจนระหว่างการซื้อน้ำขวดแพ็คเข้าบ้านกับการติดตั้งเครื่องกรองน้ำระบบสมาชิก Coway ประหยัดเงินกว่า ปลอดขยะพลาสติก และสะดวกสบายกว่าอย่างไร',
    readTime: '3 นาที',
    date: 'อัปเดตล่าสุด 2026',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    keyPoints: [
      'ประหยัดกว่าซื้อน้ำดื่มบรรจุขวดเฉลี่ย 8,000 - 15,000 บาท/ปี',
      'หมดปัญหาต้องแบกน้ำหนัก 10-20 กก. ขึ้นคอนโดหรือเข้าบ้านทุกสัปดาห์',
      'ช่วยลดขยะขวดพลาสติก Single-use plastic ได้มากกว่า 1,400 ขวดต่อครอบครัว/ปี',
      'กดดื่มน้ำร้อน-น้ำเย็น-น้ำธรรมดาได้ไม่จำกัดตลอด 24 ชม.'
    ],
    content: [
      'หลายคนคุ้นชินกับการซื้อน้ำดื่มบรรจุขวดหรือน้ำถังขนาดใหญ่เข้าบ้าน แต่เมื่อคำนวณค่าใช้จ่ายรายเดือนของครอบครัวขนาด 3-4 คน จะพบว่าค่าใช้จ่ายค่าน้ำดื่มเฉลี่ยอยู่ที่ 1,200 - 1,800 บาทต่อเดือน หรือมากกว่า 15,000 - 20,000 บาทต่อปี แถมยังต้องเสียเวลาและแรงกายในการยกน้ำหนักเข้าบ้าน',
      'เครื่องกรองน้ำระบบ Subscription ของ Coway เข้ามาปฏิวัติปัญหานี้ด้วยค่างวดเริ่มต้นเพียงหลักร้อยต่อเดือน (เฉลี่ยเริ่มต้นเพียงวันละ 20-30 กว่าบาท) โดยไม่ต้องจ่ายเงินก้อนหลักหมื่น และที่สำคัญคือ "รวมทุกอย่างแล้ว" ไม่มีค่าใช้จ่ายแอบแฝง',
      'ตลอดอายุสัญญา คุณจะได้รับบริการดูแลทำความสะอาดถังน้ำ ฆ่าเชื้อ และเปลี่ยนไส้กรองแท้ฟรีจาก Cody ทุก 2 และ 4 เดือน พร้อมรับประกันตัวเครื่อง 100% ทำให้เป็นทางเลือกที่คุ้มค่าและสะดวกสบายที่สุดสำหรับครอบครัวยุคใหม่'
    ]
  },
  {
    id: 'ro-filtration-standard',
    title: 'เจาะลึกระบบกรองน้ำ RO (Reverse Osmosis) Coway สะอาดบริสุทธิ์ระดับ 0.0001 ไมครอน',
    category: 'water',
    categoryLabel: 'เทคโนโลยี & มาตรฐานน้ำดื่ม',
    summary: 'ไขข้อข้องใจว่าทำไมระบบ RO ของ Coway ถึงได้รับมาตรฐานระดับโลก WQA Gold Seal สามารถดักจับเชื้อไวรัส แบคทีเรีย โลหะหนัก และไมโครพลาสติกได้อย่างหมดจด',
    readTime: '4 นาที',
    date: 'อัปเดตล่าสุด 2026',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    keyPoints: [
      'ความละเอียด 0.0001 ไมครอน (เล็กกว่าเส้นผมมนุษย์ถึง 500,000 เท่า)',
      'ขจัดเชื้อโรค ไวรัส แบคทีเรีย สารเคมีตกค้าง และโลหะหนักได้ถึง 99.99%',
      'ผ่านมาตรฐานระดับโลก WQA (Water Quality Association) Gold Seal',
      'ได้การรับรองมาตรฐานฮาลาล (HALAL) สะอาด ปลอดภัยสำหรับทุกคน'
    ],
    content: [
      'คุณภาพน้ำประปาในปัจจุบันอาจมีสิ่งปนเปื้อนที่มองไม่เห็นด้วยตาเปล่า เช่น ตะกอนสนิมจากท่อส่งน้ำเก่า คลอรีน โลหะหนักอย่างตะกั่ว ปรอท หรือแม้แต่ไมโครพลาสติกและสารเคมีตกค้าง',
      'ระบบการกรอง Reverse Osmosis (RO) ของ Coway เป็นเทคโนโลยีเดียวกับที่ใช้ในอุตสาหกรรมการแพทย์และอากาศยาน โดยใช้เยื่อเมมเบรนความละเอียด 0.0001 ไมครอน มีเพียงโมเลกุลของน้ำบริสุทธิ์เท่านั้นที่ผ่านได้',
      'นอกจากนี้ Coway ยังมีระบบไส้กรอง Plus Inno-Sense ปรับรสชาติน้ำให้นุ่มละมุน ดื่มง่าย ไร้กลิ่นไม่พึงประสงค์ ทำให้คุณและครอบครัวมั่นใจได้ในทุกแก้วที่ดื่ม'
    ]
  },
  {
    id: 'cody-heart-service-value',
    title: 'Cody Heart Service คืออะไร? ทำไมถึงเป็นจุดเด่นที่ทำให้ลูกค้า Coway ประทับใจมากที่สุด',
    category: 'service',
    categoryLabel: 'บริการหลังการขาย',
    summary: 'หมดกังวลเรื่องลืมเปลี่ยนไส้กรองหรือถังน้ำสกปรก ด้วยทีมงานผู้เชี่ยวชาญ Cody ที่นัดหมายเข้าดูแลทำความสะอาดและเปลี่ยนไส้กรองแท้ถึงบ้านฟรีตลอดอายุสัญญา',
    readTime: '3 นาที',
    date: 'อัปเดตล่าสุด 2026',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    keyPoints: [
      'ล้างทำความสะอาดและฆ่าเชื้อระบบน้ำทุก 2 เดือน ด้วยอุปกรณ์เฉพาะทาง',
      'เปลี่ยนไส้กรองแท้ 100% ตรงตามรอบทุก 4 เดือน',
      'รับประกันอะไหล่ ตัวเครื่อง และค่าบริการช่างฟรีตลอดอายุสัญญา',
      'มีระบบนัดหมายล่วงหน้าและทีม Cody ผู้หญิงที่ผ่านการอบรมระดับมืออาชีพ'
    ],
    content: [
      'ปัญหาใหญ่ของคนที่ซื้อเครื่องกรองน้ำทั่วไปคือ "ซื้อมาแล้วไม่มีคนดูแล" ไม่รู้ว่าต้องเปลี่ยนไส้กรองเมื่อไหร่ ซื้อไส้กรองแท้ที่ไหน หรือปล่อยให้ถังน้ำสะสมเชื้อโรคจนน้ำไม่สะอาด',
      'Coway จึงคิดค้นระบบ "Cody Heart Service" ขึ้นมาเพื่อแก้ปัญหานี้อย่างถาวร โดยมีผู้เชี่ยวชาญ Cody ติดต่อนัดหมายเข้าดูแลบ้านคุณทุก 2 เดือน เพื่อล้างถังน้ำ ฆ่าเชื้อด้วยชุด Water Care Kit และเปลี่ยนไส้กรองตามรอบทุก 4 เดือน',
      'บริการทั้งหมดนี้ "ฟรีไม่มีค่าใช้จ่ายเพิ่ม" ตลอดระยะเวลาสัญญา ทำให้ผู้ใช้ Coway ได้ดื่มน้ำสะอาดสดใหม่ที่ได้มาตรฐานเสมอโดยไม่ต้องเหนื่อยจำหรือจัดการเอง'
    ]
  },
  {
    id: 'air-purifier-pm25-protection',
    title: 'ปกป้องคนที่คุณรักจาก PM 2.5 และสารก่อภูมิแพ้ด้วยเครื่องฟอกอากาศ Coway',
    category: 'air',
    categoryLabel: 'สุขภาพ & อากาศบริสุทธิ์',
    summary: 'ฝุ่น PM 2.5 และมลพิษในอากาศส่งผลต่อระบบทางเดินหายใจอย่างไร และทำไมเครื่องฟอกอากาศ Coway ถึงช่วยให้คุณหลับสบายและมีสุขภาพปอดที่ดีขึ้น',
    readTime: '3 นาที',
    date: 'อัปเดตล่าสุด 2026',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    keyPoints: [
      'แผ่นกรอง True HEPA ดักจับฝุ่นละอองขนาดเล็กถึง 0.01 ไมครอน ได้ถึง 99.999%',
      'ขจัดสารก่อภูมิแพ้ ขนสัตว์ ละอองเกสรดอกไม้ และกลิ่นไม่พึงประสงค์',
      'ทำงานเงียบสนิท ไม่รบกวนการนอนหลับ ประหยัดไฟระดับมาตรฐานสากล',
      'มีทีม Cody ดูแลเปลี่ยนแผ่นกรองและทำความสะอาดตัวเครื่องฟรีถึงบ้าน'
    ],
    content: [
      'ในยุคที่มลพิษทางอากาศและฝุ่น PM 2.5 เกิดขึ้นเป็นประจำทุกปี อากาศภายในบ้านอาจมีฝุ่นละออง สารก่อภูมิแพ้ ขนสัตว์เลี้ยง ไรฝุ่น และเชื้อไวรัสสะสมอยู่มากกว่าที่เราคิด',
      'เครื่องฟอกอากาศ Coway ได้รับการออกแบบตามหลักอากาศพลศาสตร์ พร้อมระบบกรอง 4 ขั้นตอนที่ผสานแผ่นกรอง True HEPA สามารถดักจับฝุ่นละเอียดและเชื้อโรคขนาดเล็กได้อย่างมีประสิทธิภาพสูง',
      'ช่วยลดอาการภูมิแพ้ จาม คัดจมูก และทำให้ทุกคนในครอบครัว ทั้งเด็ก ผู้สูงอายุ และสัตว์เลี้ยง ได้สูดอากาศบริสุทธิ์และนอนหลับสนิทตลอดคืน'
    ]
  }
];

interface ArticlesSectionProps {
  siteSettings?: SiteSettings;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ siteSettings }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = activeCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <section id="articles" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>KNOWLEDGE & INSIGHTS · สาระน่ารู้เพื่อสุขภาพ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            ทำไมใครๆ ถึงเลือกใช้ผลิตภัณฑ์ Coway?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            รวมบทความ ข้อมูลเจาะลึก และเหตุผลที่ทำให้ Coway เป็นแบรนด์เครื่องกรองน้ำและเครื่องฟอกอากาศอันดับ 1 ที่ครองใจผู้บริโภค
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'all', label: 'บทความทั้งหมด' },
            { id: 'water', label: 'เครื่องกรองน้ำ & RO' },
            { id: 'service', label: 'บริการ Cody Heart Service' },
            { id: 'air', label: 'เครื่องฟอกอากาศ & สุขภาพ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image & Category Badge */}
              <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full shadow-xs">
                    {article.categoryLabel}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-700 text-[11px] font-medium rounded-lg shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{article.readTime}</span>
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Highlights Bullet points */}
                  <div className="pt-2 space-y-2">
                    {article.keyPoints.slice(0, 2).map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer group/btn"
                  >
                    <span>อ่านบทความฉบับเต็ม</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href={siteSettings?.lineUrl || "https://line.me"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#06c755] hover:bg-[#05b34c] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>ปรึกษาทาง LINE</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Fast Action Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ยินดีให้คำปรึกษาและเทียบความคุ้มค่าฟรี</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              ต้องการคำแนะนำเลือกรุ่นเครื่องกรองน้ำที่คุ้มค่าที่สุดสำหรับบ้านคุณ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              ทีมงานผู้เชี่ยวชาญ Coway พร้อมแนะนำโปรโมชั่นตรงใจ เช็กคิวติดตั้งฟรี และดูแลเอกสารให้ครบจบในที่เดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#06c755] hover:bg-[#05b34c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>แอด LINE ขอโปรโมชั่นพิเศษ</span>
            </a>

            <a
              href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-slate-900" />
              <span>โทร {siteSettings?.phoneDisplay || '02-000-0000'}</span>
            </a>
          </div>
        </div>

      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-3 pt-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                {selectedArticle.categoryLabel}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span>ใช้เวลาอ่าน {selectedArticle.readTime}</span>
              </div>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden h-56 bg-slate-100">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Key Takeaways */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-sky-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>สรุปสาระสำคัญที่คุณจะได้รับ:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-sky-950">
                {selectedArticle.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Article Content Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArticle.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Modal CTA Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={siteSettings?.lineUrl || "https://line.me"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#06c755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ปรึกษาโปรโมชั่นทาง LINE</span>
                </a>

                <a
                  href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
                  className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทรด่วน</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
