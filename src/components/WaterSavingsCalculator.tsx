import React, { useState } from 'react';
import { Calculator, ArrowRight, Sparkles, TrendingDown, Leaf, ShieldAlert } from 'lucide-react';
import { CowayProduct } from '../types';

interface WaterSavingsCalculatorProps {
  onSelectRecommendedModel: (modelId: string) => void;
}

export const WaterSavingsCalculator: React.FC<WaterSavingsCalculatorProps> = ({
  onSelectRecommendedModel,
}) => {
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [packsPerWeek, setPacksPerWeek] = useState<number>(4); // pack of 1.5L (6 bottles) ~ 55 baht
  const packPrice = 60; // THB per pack

  // Monthly cost of bottled water
  const monthlyBottledCost = packsPerWeek * 4 * packPrice; // e.g. 4 * 4 * 60 = 960 THB (plus ice 300 THB = 1260 THB)
  const monthlyIceCost = 250;
  const totalMonthlyBottled = monthlyBottledCost + monthlyIceCost;
  const yearlyBottledCost = totalMonthlyBottled * 12;

  // Coway Neo Plus monthly is 790 THB
  const cowayMonthly = familyMembers <= 2 ? 490 : familyMembers <= 5 ? 790 : 990;
  const cowayYearly = cowayMonthly * 12;
  const yearlySavings = Math.max(0, yearlyBottledCost - cowayYearly);

  // Plastic bottles saved per year (6 bottles/pack * packsPerWeek * 52)
  const plasticBottlesSaved = packsPerWeek * 6 * 52;

  // Recommended model based on members
  const recommended =
    familyMembers <= 2
      ? { id: 'cinnamon', name: 'Coway Cinnamon (P-6320R)', monthly: 490, reason: 'เหมาะสำหรับ 1-2 คน ขนาดกะทัดรัด ประหยัดพื้นที่' }
      : familyMembers <= 4
      ? { id: 'neo-plus', name: 'Coway Neo Plus (CHP-264L)', monthly: 790, reason: 'ยอดนิยมอันดับ 1 สำหรับครอบครัว 3-4 คน มีน้ำร้อน น้ำเย็น' }
      : { id: 'villaem-ii', name: 'Coway Villaem II (CHP-18AR)', monthly: 990, reason: 'ถังใหญ่จุใจ 11.3 ลิตร สำหรับครอบครัวใหญ่ 5 คนขึ้นไป' };

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2">
            CALCULATOR · คำนวณความคุ้มค่า
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            ประหยัดเงินได้หลักหมื่นต่อปี เมื่อเปลี่ยนมาใช้ Coway
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            ลองคำนวณค่าน้ำดื่มขวดและน้ำแข็งที่คุณจ่ายในแต่ละเดือน แล้วเทียบกับความสะดวกสบายของ Coway
          </p>
        </div>

        {/* Interactive Calculator Container */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Input Sliders */}
            <div className="lg:col-span-6 space-y-6">
              {/* Slider 1: Family Members */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    จำนวนสมาชิกในบ้าน
                  </label>
                  <span className="text-lg font-bold text-sky-600 font-mono">
                    {familyMembers} คน
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 คน (อยู่คนเดียว/คอนโด)</span>
                  <span>5 คน (ครอบครัวกลาง)</span>
                  <span>10+ คน (ครอบครัวใหญ่/โฮมออฟฟิศ)</span>
                </div>
              </div>

              {/* Slider 2: Packs Bought per Week */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    ปริมาณการซื้อน้ำดื่มบรรจุขวดต่อสัปดาห์
                  </label>
                  <span className="text-lg font-bold text-sky-600 font-mono">
                    {packsPerWeek} แพ็ค
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={packsPerWeek}
                  onChange={(e) => setPacksPerWeek(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 แพ็ค (~60.-)</span>
                  <span>6 แพ็ค (~360.-)</span>
                  <span>12 แพ็ค (~720.-)</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  *รวมประมาณการค่าน้ำแข็งยูนิตและค่าเดินทางไปซื้อน้ำดื่มประจำเดือน
                </div>
              </div>

              {/* Eco Impact Callout */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="text-xs text-emerald-900 leading-relaxed">
                  คุณจะช่วยลดขยะขวดพลาสติกได้ถึง <strong className="font-bold text-emerald-800 font-mono text-sm">{plasticBottlesSaved.toLocaleString()}</strong> ขวด/ปี เป็นมิตรต่อโลกและสุขภาพของครอบครัว
                </div>
              </div>
            </div>

            {/* Results & Recommendation Panel */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-md space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  สรุปผลการเปรียบเทียบค่าใช้จ่าย
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500">ซื้อน้ำขวด + น้ำแข็ง/ปี:</div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 tabular-nums">
                      ฿{yearlyBottledCost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">เปลี่ยนใช้ Coway/ปี:</div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 tabular-nums">
                      ฿{cowayYearly.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-sky-800 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-sky-600" />
                    <span>ประหยัดเงินในกระเป๋าได้ถึง</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-sky-600 font-mono tabular-nums mt-0.5">
                    ฿{yearlySavings.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-600">/ ปี</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 max-w-[120px]">
                  ประหยัดทั้งเงินและไม่ต้องยกน้ำหนักให้ปวดหลัง
                </div>
              </div>

              {/* Recommended Model Box */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>รุ่นที่ระบบแนะนำสำหรับครอบครัวคุณ:</span>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {recommended.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {recommended.reason}
                    </div>
                    <div className="text-xs font-bold text-sky-600 mt-1">
                      เพียง ฿{recommended.monthly}.- / เดือน
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectRecommendedModel(recommended.id)}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    ดูรุ่นนี้ทันที
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
