import React from 'react';
import { InquiryItem } from '../types';
import { X, Trash2, MessageCircle, Phone, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: InquiryItem[];
  onRemoveItem: (index: number) => void;
  onClearItems: () => void;
}

export const InquiryDrawer: React.FC<InquiryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearItems,
}) => {
  if (!isOpen) return null;

  const totalMonthly = items.reduce(
    (sum, item) => sum + item.selectedOption.monthlyPrice * item.quantity,
    0
  );

  const generateLineSummary = () => {
    let text = 'สวัสดีครับ/ค่ะ สนใจขอใบเสนอราคาและโปรโมชั่นพิเศษ Coway ดังนี้:\n';
    items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.product.name} (${item.product.modelCode}) - ${item.selectedOption.label} ราคา ฿${item.selectedOption.monthlyPrice.toLocaleString()}/เดือน (จำนวน ${item.quantity} เครื่อง)\n`;
    });
    text += `\nยอดรวมค่าบริการรายเดือนประมาณการ: ฿${totalMonthly.toLocaleString()} บาท/เดือน\nต้องการปรึกษาเรื่องเงื่อนไขและคิวติดตั้งครับ`;
    return encodeURIComponent(text);
  };

  const lineUrl = `https://line.me/R/ti/p/@cowayth?text=${generateLineSummary()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-600" />
            <h2 className="font-bold text-slate-900 text-base">
              รายการสินค้าที่สนใจ ({items.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                ยังไม่มีรายการสินค้าที่เลือก
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                กดปุ่ม "สนใจรุ่นนี้" บนการ์ดสินค้าเพื่อเพิ่มเข้ารายการสำหรับส่งสอบถามทาง LINE
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-slate-200/60 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {item.product.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.product.modelCode}
                    </div>
                    <div className="text-xs text-sky-700 font-medium mt-0.5">
                      {item.selectedOption.label}
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                      ฿{item.selectedOption.monthlyPrice.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">/ เดือน</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClearItems}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  ล้างรายการทั้งหมด
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-500">
                ประมาณการค่างวดรวม:
              </span>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-sky-600 tabular-nums">
                  ฿{totalMonthly.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ เดือน</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>แอด LINE ส่งรายการขอโปรโมชั่นพิเศษ</span>
              </a>

              <a
                href="tel:0829988998"
                className="w-full py-2.5 px-4 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>โทรด่วนปรึกษาเจ้าหน้าที่</span>
              </a>
            </div>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ฟรีค่าติดตั้ง + ไส้กรองแท้ + ล้างถังฟรีตลอดสัญญา</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
