import React from 'react';
import { ShieldCheck, Sparkles, Clock, RefreshCw, Award, CheckCircle2, Droplets } from 'lucide-react';
import codyImg from '../assets/images/coway_cody_service_1790923106865.jpg';

export const ServiceHighlights: React.FC = () => {
  const steps = [
    {
      period: 'ทุก 2 เดือน',
      title: 'Cody Heart Service ล้างถังและฆ่าเชื้อ',
      desc: 'ผู้เชี่ยวชาญ Cody เข้าบริการทำความสะอาดถังเก็บน้ำ ก๊อกจ่ายน้ำ และชิ้นส่วนภายนอกด้วยชุดอุปกรณ์ Care Kit สเตอริไลซ์ฆ่าเชื้อโรค 100%',
    },
    {
      period: 'ทุก 4 เดือน',
      title: 'เปลี่ยนไส้กรองแท้ Coway ฟรีถึงบ้าน',
      desc: 'เปลี่ยนชุดไส้กรองใหม่แกะกล่องตามมาตรฐานโรงงานเกาหลีใต้ น้ำจึงสะอาด บริสุทธิ์ และได้มาตรฐานระดับสากลสม่ำเสมอตลอดปี',
    },
    {
      period: 'ตลอดอายุสัญญา',
      title: 'รับประกันตัวเครื่องและซ่อมบำรุงฟรี',
      desc: 'ฟรีค่าแรง ฟรีค่าอะไหล่ 100% หากเกิดปัญหาขัดข้อง ทีมช่างเทคนิคพร้อมเข้าดูแลซ่อมแซมถึงบ้านอย่างรวดเร็ว',
    },
  ];

  const filtrationSteps = [
    { step: '01', name: 'Plus Neo-Sense', role: 'ดักจับตะกอน สนิม ทราย และคลอรีนในน้ำประปา' },
    { step: '02', name: 'RO Membrane (0.0001μm)', role: 'กรองโลหะหนัก เชื้อไวรัส แบคทีเรีย และสารก่อมะเร็ง' },
    { step: '03', name: 'Plus Inno-Sense', role: 'กำจัดกลิ่นไม่พึงประสงค์ ปรับรสชาติน้ำให้นุ่ม อร่อย ชื่นใจ' },
    { step: '04', name: 'Antibacterial Filter', role: 'ควบคุมและยับยั้งการเจริญเติบโตของจุลินทรีย์ในถังน้ำ' },
  ];

  return (
    <section id="services" className="py-16 sm:py-24 bg-slate-50 border-t border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2">
            HEART SERVICE · การบริการที่ไม่มีใครเหมือน
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            ดื่มน้ำสะอาดมั่นใจ 365 วัน ด้วยบริการ “Cody” ดูแลถึงบ้าน
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            จุดเด่นที่ทำให้ Coway ครองใจคนไทย คือบริการหลังการขายระดับพรีเมียมที่คุณไม่ต้องจำวันเปลี่ยนไส้กรอง ไม่ต้องล้างเครื่องเอง เพราะเราส่งผู้เชี่ยวชาญ Cody เข้าไปดูแลให้คุณถึงที่ฟรีตลอดอายุสัญญา
          </p>
        </div>

        {/* Top Split: Cody Image and Service Routine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Cody Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <img
                src={codyImg}
                alt="Coway Cody Heart Service Specialist"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[400px] object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      ชุดอุปกรณ์ทำความสะอาดเฉพาะทาง Care Kit
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ผ่านการฆ่าเชื้อระบบสเตอริไลซ์ มาตรฐานความปลอดภัยระดับสากล
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Milestones */}
          <div className="lg:col-span-6 space-y-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                    {step.period}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Stage Filtration Tech Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
              TECHNOLOGY · มาตรฐานระดับโลก
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              ระบบกรองน้ำ Coway RO Membrane 6 ขั้นตอน
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ขจัดสิ่งปนเปื้อนที่มีขนาดเล็กถึง 0.0001 ไมครอน (เล็กกว่าเส้นผมถึง 1,000,000 เท่า) มั่นใจได้ในความบริสุทธิ์
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtrationSteps.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-sky-50/40 hover:border-sky-200 transition-colors"
              >
                <div className="text-2xl font-bold font-mono text-sky-600/40 mb-2">
                  {f.step}
                </div>
                <div className="font-bold text-slate-900 text-sm mb-1">
                  {f.name}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {f.role}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>ได้รับการรับรองตราทอง WQA Gold Seal จากสมาคมคุณภาพน้ำแห่งสหรัฐอเมริกา</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>มาตรฐานฮาลาล (HALAL) ปลอดภัยต่อทุกศาสนา</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
