import React from 'react';
import { CowayProduct } from '../types';
import { X, Check, Droplets, Wind, Sparkles, Bed, MessageCircle, Eye } from 'lucide-react';

interface ProductComparisonModalProps {
  products: CowayProduct[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveFromCompare: (product: CowayProduct) => void;
  onViewDetails: (product: CowayProduct) => void;
  onSelectProduct: (product: CowayProduct) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveFromCompare,
  onViewDetails,
  onSelectProduct,
}) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              เปรียบเทียบสเปกและราคาผลิตภัณฑ์ ({products.length} รุ่น)
            </h2>
            <p className="text-xs text-slate-500">
              เปรียบเทียบฟังก์ชันการทำงาน ความจุ และราคาเพื่อเลือกเครื่องที่ตอบโจทย์บ้านคุณที่สุด
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Comparison Table Body */}
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 bg-slate-50 font-semibold text-slate-700 w-44 rounded-tl-xl">
                  รุ่นสินค้า
                </th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 bg-slate-50 text-center min-w-[220px]">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => onRemoveFromCompare(p)}
                        className="self-end text-slate-400 hover:text-rose-500 p-1 mb-1"
                        title="นำออกจากการเปรียบเทียบ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 object-contain mb-2"
                        decoding="async"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="font-bold text-sm text-slate-900">{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.modelCode}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Category */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">หมวดหมู่</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-800">
                    {p.categoryLabel}
                  </td>
                ))}
              </tr>

              {/* Monthly Subscription Price */}
              <tr className="bg-sky-50/30">
                <td className="p-3 font-semibold text-sky-900">Subscription รายเดือน</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <span className="text-base font-bold text-sky-600 font-mono tabular-nums">
                      ฿{p.startingMonthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500"> / เดือน</span>
                  </td>
                ))}
              </tr>

              {/* Cash Price */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">ราคาซื้อสด</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-mono text-slate-700">
                    ฿{p.cashPrice.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Water Temperatures or Coverage Area */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">อุณหภูมิ / พื้นที่</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-800">
                    {p.category === 'water' && p.waterTypes && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {p.waterTypes.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700"
                          >
                            {t === 'hot' && 'น้ำร้อน'}
                            {t === 'cold' && 'น้ำเย็น'}
                            {t === 'room' && 'น้ำปกติ'}
                            {t === 'ice' && 'น้ำแข็ง'}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.category === 'air' && (
                      <span className="font-medium text-slate-800">{p.coverageArea}</span>
                    )}
                    {p.category === 'mattress' && <span>ขนาดเตียงมาตรฐาน</span>}
                    {p.category === 'bidet' && <span>ฝารองนั่งชำระล้าง</span>}
                  </td>
                ))}
              </tr>

              {/* Tank Capacity / Engine */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">ความจุถังน้ำ</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-800">
                    {p.tankCapacity || '-'}
                  </td>
                ))}
              </tr>

              {/* Filtration System */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">ระบบการกรอง</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-700">
                    {p.filtrationSystem || '-'}
                  </td>
                ))}
              </tr>

              {/* Dimensions */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">ขนาดเครื่อง (กxลxส)</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-600 font-mono">
                    {p.dimensions}
                  </td>
                ))}
              </tr>

              {/* Cody Cycle */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">รอบบริการ Cody</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-sky-700 font-medium">
                    {p.codyCycle}
                  </td>
                ))}
              </tr>

              {/* Action Buttons Row */}
              <tr>
                <td className="p-3 bg-slate-50/50 font-semibold text-slate-600">การดำเนินการ</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onViewDetails(p);
                        }}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูสเปกเต็ม</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>สนใจสั่งซื้อ</span>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
