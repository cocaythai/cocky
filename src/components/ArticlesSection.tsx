import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  X,
  FileText
} from 'lucide-react';
import { SiteSettings } from '../types/settings';
import { Article } from '../types/article';
import { DEFAULT_ARTICLES } from '../data/defaultArticles';

interface ArticlesSectionProps {
  siteSettings?: SiteSettings;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ siteSettings }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const rawArticles: Article[] = siteSettings?.articles && siteSettings.articles.length > 0
    ? siteSettings.articles
    : DEFAULT_ARTICLES;

  const filteredArticles = activeCategory === 'all'
    ? rawArticles
    : rawArticles.filter(a => a.category === activeCategory);

  const categories = [
    { id: 'all', label: 'บทความทั้งหมด', count: rawArticles.length },
    { id: 'water', label: 'เครื่องกรองน้ำ & RO', count: rawArticles.filter(a => a.category === 'water').length },
    { id: 'service', label: 'บริการ Cody Heart Service', count: rawArticles.filter(a => a.category === 'service').length },
    { id: 'air', label: 'เครื่องฟอกอากาศ & สุขภาพ', count: rawArticles.filter(a => a.category === 'air').length },
    { id: 'health', label: 'สาระสุขภาพ & ความคุ้มค่า', count: rawArticles.filter(a => a.category === 'health').length },
  ].filter(cat => cat.id === 'all' || cat.count > 0);

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
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image & Category Badge */}
                <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                  <img
                    src={article.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full shadow-xs">
                      {article.categoryLabel || 'สาระน่ารู้'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-700 text-[11px] font-medium rounded-lg shadow-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{article.readTime || '3 นาที'}</span>
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
                    {article.keyPoints && article.keyPoints.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {article.keyPoints.slice(0, 2).map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 max-w-md mx-auto space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">ยังไม่มีบทความในหมวดหมู่นี้</h4>
            <p className="text-xs text-slate-500">เลือกดูหมวดหมู่อื่นเพื่ออ่านบทความและสาระน่ารู้เกี่ยวกับ Coway</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              ดูบทความทั้งหมด
            </button>
          </div>
        )}

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
                src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Key Takeaways */}
            {selectedArticle.keyPoints && selectedArticle.keyPoints.length > 0 && (
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
            )}

            {/* Article Content Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArticle.content && selectedArticle.content.map((p, idx) => (
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
