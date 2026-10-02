import React from 'react';
import { Sparkles, Lightbulb, CheckCircle2, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { SiteSettings, KnowledgeTip } from '../types/settings';
import { DEFAULT_KNOWLEDGE_TIPS } from '../data/defaultKnowledge';

interface KnowledgeSectionProps {
  siteSettings?: SiteSettings;
}

export const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({ siteSettings }) => {
  const tips: KnowledgeTip[] = siteSettings?.knowledgeTips && siteSettings.knowledgeTips.length > 0
    ? siteSettings.knowledgeTips.filter((t) => t.isActive !== false)
    : DEFAULT_KNOWLEDGE_TIPS.filter((t) => t.isActive !== false);

  if (tips.length === 0) return null;

  return (
    <section id="knowledge" className="py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>KNOWLEDGE & HEALTH TIPS · สาระน่ารู้และเคล็ดลับสุขภาพ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            เกร็ดความรู้เพื่อสุขอนามัยที่ดีของทุกคนในบ้าน
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            รวบรวมคำแนะนำจากผู้เชี่ยวชาญด้านน้ำดื่มและคุณภาพอากาศ เพื่อการดูแลสุขภาพที่ถูกต้องและคุ้มค่าที่สุด
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-slate-50 hover:bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 relative">
                  <img
                    src={tip.imageUrl}
                    alt={tip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                      {tip.tag || 'สาระน่ารู้'}
                    </span>
                  </div>
                  {tip.readTime && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-0.5 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-semibold rounded-md shadow-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{tip.readTime}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors line-clamp-2">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {tip.description}
                  </p>
                </div>
              </div>

              {/* Key Takeaway Box */}
              {tip.keyTakeaway && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-sky-900 bg-sky-50/70 p-2.5 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{tip.keyTakeaway}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
