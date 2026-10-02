import React, { useState, useMemo } from 'react';
import { CowayProduct, ProductCategory, WaterType } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { ProductCard } from './ProductCard';
import { Search, Filter, SlidersHorizontal, Scale, X, Droplets, Wind, Sparkles, Bed, Check, Database, RefreshCw, PlusCircle, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ProductCatalogProps {
  products: CowayProduct[];
  loading?: boolean;
  dataSource?: 'supabase' | 'mock';
  supabaseCount?: number;
  statusMessage?: string;
  onSeedSampleProducts?: () => Promise<{ success: boolean; message: string }>;
  onRefetch?: () => void;
  onViewDetails: (product: CowayProduct) => void;
  onQuickInquiry: (product: CowayProduct) => void;
  comparedProducts: CowayProduct[];
  onToggleCompare: (product: CowayProduct) => void;
  onOpenCompareModal: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  loading = false,
  dataSource = 'mock',
  supabaseCount = 0,
  statusMessage,
  onSeedSampleProducts,
  onRefetch,
  onViewDetails,
  onQuickInquiry,
  comparedProducts,
  onToggleCompare,
  onOpenCompareModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType | 'all'>('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showMockPreview, setShowMockPreview] = useState(false);

  const activeCatalog = useMemo(() => {
    if (products.length > 0) return products;
    if (showMockPreview) return MOCK_PRODUCTS;
    return [];
  }, [products, showMockPreview]);

  const handleSeed = async () => {
    if (!onSeedSampleProducts) return;
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await onSeedSampleProducts();
      setSeedResult(res);
      setTimeout(() => setSeedResult(null), 4000);
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message || 'เกิดข้อผิดพลาด' });
    } finally {
      setIsSeeding(false);
    }
  };

  const categories = [
    { id: 'all', label: 'ทั้งหมด', count: activeCatalog.length },
    { id: 'water', label: 'เครื่องกรองน้ำ', count: activeCatalog.filter(p => p.category === 'water').length, icon: Droplets },
    { id: 'air', label: 'เครื่องฟอกอากาศ', count: activeCatalog.filter(p => p.category === 'air').length, icon: Wind },
    { id: 'bidet', label: 'ฝารองนั่งสุขภัณฑ์', count: activeCatalog.filter(p => p.category === 'bidet').length, icon: Sparkles },
    { id: 'mattress', label: 'ที่นอนและเตียง', count: activeCatalog.filter(p => p.category === 'mattress').length, icon: Bed },
  ];

  const filteredProducts = useMemo(() => {
    return activeCatalog
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Water type filter (only relevant for water category or all)
        if (selectedWaterType !== 'all') {
          if (!p.waterTypes || !p.waterTypes.includes(selectedWaterType)) {
            return false;
          }
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(query);
          const matchModel = p.modelCode.toLowerCase().includes(query);
          const matchTag = p.tagline.toLowerCase().includes(query);
          const matchDesc = p.shortDesc.toLowerCase().includes(query);
          return matchName || matchModel || matchTag || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return a.startingMonthlyPrice - b.startingMonthlyPrice;
        }
        if (sortBy === 'price-desc') {
          return b.startingMonthlyPrice - a.startingMonthlyPrice;
        }
        // default 'featured'
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
  }, [products, selectedCategory, selectedWaterType, searchQuery, sortBy]);

  return (
    <section id="products" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="text-xs sm:text-sm font-semibold text-sky-600 uppercase tracking-wider mb-2">
            CATALOG · สินค้าทั้งหมดของ COWAY
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            เลือกสรรผลิตภัณฑ์ Coway ที่เหมาะกับไลฟ์สไตล์คุณ
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            สมัครสมาชิกรายเดือนสบายกระเป๋า ไม่มีค่าใช้จ่ายแอบแฝง ฟรีติดตั้งและไส้กรองแท้ตลอดอายุสัญญา
          </p>
        </div>

        {/* Filter Toolbar Controls */}
        <div className="space-y-4 mb-8">
          {/* Main Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as ProductCategory);
                    if (cat.id !== 'water' && cat.id !== 'all') {
                      setSelectedWaterType('all');
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Search, Water Type, Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารุ่นสินค้า เช่น Neo Plus, My Ice, AP-2021A..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sub Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Water Type pills if in water category or all */}
              {(selectedCategory === 'water' || selectedCategory === 'all') && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedWaterType('all')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedWaterType === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ทุกระบบ
                  </button>
                  <button
                    onClick={() => setSelectedWaterType('ice')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedWaterType === 'ice'
                        ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    มีน้ำแข็ง
                  </button>
                  <button
                    onClick={() => setSelectedWaterType('hot')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedWaterType === 'hot'
                        ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    น้ำร้อน/เย็น
                  </button>
                  <button
                    onClick={() => setSelectedWaterType('room')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedWaterType === 'room'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    อุณหภูมิห้อง
                  </button>
                </div>
              )}

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="featured">รุ่นยอดนิยม</option>
                  <option value="price-asc">ราคา: ต่ำไปสูง</option>
                  <option value="price-desc">ราคา: สูงไปต่ำ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-6 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isCompared = comparedProducts.some((p) => p.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewDetails}
                  onQuickInquiry={onQuickInquiry}
                  isCompared={isCompared}
                  onToggleCompare={onToggleCompare}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto space-y-4">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800">
              ไม่พบรายการสินค้าที่ตรงกับคำค้นหา
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นเพื่อดูสินค้า Coway ทั้งหมด
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedWaterType('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {/* Bottom Floating Compare Bar if user selected items */}
        {comparedProducts.length > 0 && (
          <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 max-w-2xl mx-auto z-30 bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold">
                  เปรียบเทียบสินค้า ({comparedProducts.length}/3 รุ่น)
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {comparedProducts.map((p) => p.name).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCompareModal}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                ดูตารางเปรียบเทียบ
              </button>
              <button
                onClick={() => {
                  comparedProducts.forEach((p) => onToggleCompare(p));
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                title="ล้างรายการเปรียบเทียบ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
