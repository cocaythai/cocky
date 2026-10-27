import { CowayProduct, ProductFilterParams, ProductCategory } from '../types/index.ts';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from './supabaseClient';
import { localProductStorage } from './localProductStorage';

// Fallback image asset for mapped products if image_url is missing
import defaultFallbackImg from '../assets/images/coway_neo_plus_1790923072942.jpg';
import myIceFallbackImg from '../assets/images/coway_my_ice_1790923084460.jpg';

export interface DataFetchResult {
  products: CowayProduct[];
  source: 'supabase' | 'mock';
  supabaseCount: number;
  message?: string;
}

/**
 * Mapper function to convert Supabase row (having at least id, name, price, image_url)
 * into a fully-functional CowayProduct model.
 */
function mapSupabaseRowToProduct(row: any, index: number): CowayProduct {
  const numericPrice = Number(row.price) || 790;
  
  // Check and extract embedded specs JSON from description if present
  let embeddedSpecs: any = null;
  let cleanDescription = row.description || '';
  if (typeof row.description === 'string' && row.description.includes('<!-- COWAY_EXTENDED_SPECS:')) {
    try {
      const match = row.description.match(/<!-- COWAY_EXTENDED_SPECS:([\s\S]*?) -->/);
      if (match && match[1]) {
        embeddedSpecs = JSON.parse(match[1]);
        cleanDescription = row.description.replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();
      }
    } catch (e) {
      console.warn('[ProductService] Failed to parse embedded specs:', e);
    }
  }

  // Extract up to 5 images from row.images (array or json string) or embeddedSpecs.images, fallback to image_url / image
  let imagesList: string[] = [];
  
  // Safely check candidate sources in order of richness
  let rawImages: any = null;
  if (Array.isArray(row.images) && row.images.length > 0) {
    rawImages = row.images;
  } else if (Array.isArray(embeddedSpecs?.images) && embeddedSpecs.images.length > 0) {
    rawImages = embeddedSpecs.images;
  } else if (typeof row.images === 'string' && row.images.trim()) {
    rawImages = row.images;
  } else if (typeof embeddedSpecs?.images === 'string' && embeddedSpecs.images.trim()) {
    rawImages = embeddedSpecs.images;
  }

  if (Array.isArray(rawImages) && rawImages.length > 0) {
    imagesList = rawImages.filter((img: any) => typeof img === 'string' && img.trim().length > 0).slice(0, 5);
  } else if (typeof rawImages === 'string' && rawImages.trim()) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) {
        imagesList = parsed.filter((img: any) => typeof img === 'string' && img.trim().length > 0).slice(0, 5);
      }
    } catch {
      imagesList = rawImages.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 5);
    }
  }

  // Also check if embeddedSpecs had images that weren't captured
  if (imagesList.length <= 1 && Array.isArray(embeddedSpecs?.images) && embeddedSpecs.images.length > 1) {
    const specImages = embeddedSpecs.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
    if (specImages.length > 1) {
      imagesList = specImages.slice(0, 5);
    }
  }

  const defaultImg = index % 2 === 0 ? defaultFallbackImg : myIceFallbackImg;
  const primaryImage = imagesList[0] || row.image_url || row.image || defaultImg;

  // Make sure primaryImage is present in imagesList
  if (primaryImage && !imagesList.includes(primaryImage)) {
    imagesList.unshift(primaryImage);
    imagesList = imagesList.slice(0, 5);
  } else if (imagesList.length === 0 && primaryImage) {
    imagesList = [primaryImage];
  }

  const displayOrder = typeof row.display_order === 'number'
    ? row.display_order
    : typeof row.order === 'number'
    ? row.order
    : typeof embeddedSpecs?.display_order === 'number'
    ? embeddedSpecs.display_order
    : typeof embeddedSpecs?.order === 'number'
    ? embeddedSpecs.order
    : index + 1;

  const name = row.name || `Coway Product ${index + 1}`;
  const id = String(row.id || `sp-${index + 1}`);

  return {
    id,
    name,
    description: cleanDescription || `${name} ผลิตภัณฑ์คุณภาพจาก Coway เพื่อสุขภาพและสุขอนามัยที่ดีของทุกคนในบ้าน`,
    rawDescription: row.description || '',
    price: numericPrice,
    image: primaryImage,
    images: imagesList.length > 0 ? imagesList : [primaryImage],
    category: (row.category as any) || 'water',
    features: (Array.isArray(row.features)
      ? row.features
      : typeof row.features === 'string'
      ? (() => {
          try {
            return JSON.parse(row.features);
          } catch {
            return [row.features];
          }
        })()
      : [
          'บริการ Cody Heart Service ดูแลฟรีตลอดอายุสัญญา',
          'ประหยัดพลังงาน เป็นมิตรต่อสิ่งแวดล้อม',
        ]
    ).filter((f: any) => typeof f === 'string' && !f.includes('ระบบกรองน้ำมาตรฐานสากล ขจัดสารปนเปื้อน 99.99%')),
    isActive: row.is_active !== false,

    // Extended domain specifications with graceful fallbacks (embeddedSpecs priority for live Admin edits)
    modelCode: embeddedSpecs?.model_code || row.model_code || `CHP-${String(id).padStart(3, '0')}`,
    categoryLabel:
      row.category_label ||
      (row.category === 'air'
        ? 'เครื่องฟอกอากาศ'
        : row.category === 'bidet'
        ? 'ฝารองนั่งสุขภัณฑ์'
        : row.category === 'mattress'
        ? 'เก้าอี้นวด'
        : 'เครื่องกรองน้ำ'),
    tagline: embeddedSpecs?.tagline || row.tagline || 'นวัตกรรมเพื่อสุขภาพ ดื่มน้ำสะอาดสดชื่นทุกวัน',
    shortDesc:
      row.short_desc ||
      cleanDescription ||
      'นวัตกรรมระบบกรองมาตรฐานระดับโลก ดีไซน์โมเดิร์น พร้อมบริการ Cody ดูแลตลอดสัญญา',
    fullDesc:
      row.full_desc ||
      cleanDescription ||
      `${name} มาพร้อมมาตรฐานระดับสากล ผ่านการรับรอง WQA Gold Seal และระบบกรองบริสุทธิ์เพื่อทุกคนในครอบครัว`,
    subscriptionOptions: (() => {
      let raw = embeddedSpecs?.subscription_options ?? row.subscription_options;
      if (typeof raw === 'string' && raw.trim()) {
        try {
          raw = JSON.parse(raw);
        } catch {}
      }
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      let fallbackRaw = row.subscription_options;
      if (typeof fallbackRaw === 'string' && fallbackRaw.trim()) {
        try {
          fallbackRaw = JSON.parse(fallbackRaw);
        } catch {}
      }
      if (Array.isArray(fallbackRaw) && fallbackRaw.length > 0) {
        return fallbackRaw;
      }
      return [
        {
          years: 5,
          monthlyPrice: numericPrice,
          label: 'สัญญา 5 ปี (แนะนำ)',
          badge: 'ยอดนิยม',
          codyService: 'ดูแลฟรี 5 ปีเต็ม ทำความสะอาดทุก 2 เดือน เปลี่ยนไส้กรองทุก 4 เดือน',
        },
        {
          years: 7,
          monthlyPrice: Math.round(numericPrice * 0.88),
          label: 'สัญญา 7 ปี (ผ่อนเบาที่สุด)',
          badge: 'ผ่อนสบาย',
          codyService: 'ดูแลฟรี 7 ปีเต็ม ไม่มีค่าใช้จ่ายแอบแฝง',
        },
      ];
    })(),
    startingMonthlyPrice: (() => {
      let rawSub = embeddedSpecs?.subscription_options ?? row.subscription_options;
      if (typeof rawSub === 'string' && rawSub.trim()) {
        try { rawSub = JSON.parse(rawSub); } catch {}
      }
      if (Array.isArray(rawSub) && rawSub.length > 0) {
        const prices = rawSub
          .map((opt: any) => Number(opt.monthlyPrice))
          .filter((p: number) => !isNaN(p) && p > 0);
        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
      return numericPrice;
    })(),
    cashPrice: Number(row.cash_price) || (numericPrice > 0 ? numericPrice * 45 : 38900),
    waterTypes: embeddedSpecs?.water_types || row.water_types || ['hot', 'cold', 'room'],
    tankCapacity: embeddedSpecs?.tank_capacity !== undefined && embeddedSpecs?.tank_capacity !== null && String(embeddedSpecs.tank_capacity).trim() !== ''
      ? String(embeddedSpecs.tank_capacity)
      : (row.tank_capacity || row.tankCapacity || '5.8 ลิตร'),
    filtrationSystem: embeddedSpecs?.filtration_system !== undefined && embeddedSpecs?.filtration_system !== null && String(embeddedSpecs.filtration_system).trim() !== ''
      ? String(embeddedSpecs.filtration_system)
      : (row.filtration_system || row.filtrationSystem || 'Coway RO Membrane 6 ขั้นตอน'),
    coverageArea: embeddedSpecs?.coverage_area !== undefined && embeddedSpecs?.coverage_area !== null && String(embeddedSpecs.coverage_area).trim() !== ''
      ? String(embeddedSpecs.coverage_area)
      : (row.coverage_area || row.coverageArea),
    dimensions: embeddedSpecs?.dimensions !== undefined && embeddedSpecs?.dimensions !== null && String(embeddedSpecs.dimensions).trim() !== ''
      ? String(embeddedSpecs.dimensions)
      : (row.dimensions || '260 x 505 x 500 มม.'),
    weight: embeddedSpecs?.weight !== undefined && embeddedSpecs?.weight !== null && String(embeddedSpecs.weight).trim() !== ''
      ? String(embeddedSpecs.weight)
      : (row.weight || '18.0 กก.'),
    powerConsumption: embeddedSpecs?.power_consumption !== undefined && embeddedSpecs?.power_consumption !== null && String(embeddedSpecs.power_consumption).trim() !== ''
      ? String(embeddedSpecs.power_consumption)
      : (row.power_consumption || row.powerConsumption || 'ความร้อน 300W / ความเย็น 0.7A'),
    codyCycle: embeddedSpecs?.cody_cycle !== undefined && embeddedSpecs?.cody_cycle !== null && String(embeddedSpecs.cody_cycle).trim() !== ''
      ? String(embeddedSpecs.cody_cycle)
      : (row.cody_cycle || row.codyCycle || 'ทำความสะอาดฆ่าเชื้อถังทุก 2 เดือน / เปลี่ยนไส้กรองทุก 4 เดือน'),
    keyFeatures: (Array.isArray(row.features)
      ? row.features
      : [
          'บริการ Cody Heart Service ดูแลฟรีตลอดอายุสัญญา',
          'ประหยัดพลังงาน เป็นมิตรต่อสิ่งแวดล้อม',
        ]
    ).filter((f: any) => typeof f === 'string' && !f.includes('ระบบกรองน้ำมาตรฐานสากล ขจัดสารปนเปื้อน 99.99%')),
    highlights: (() => {
      let raw = embeddedSpecs?.highlights ?? row.highlights;
      if (typeof raw === 'string' && raw.trim()) {
        try {
          raw = JSON.parse(raw);
        } catch {}
      }
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      let fallbackRaw = row.highlights;
      if (typeof fallbackRaw === 'string' && fallbackRaw.trim()) {
        try {
          fallbackRaw = JSON.parse(fallbackRaw);
        } catch {}
      }
      if (Array.isArray(fallbackRaw) && fallbackRaw.length > 0) {
        return fallbackRaw;
      }
      return [
        {
          title: 'RO Membrane กรองบริสุทธิ์',
          description: 'กรองละเอียดถึง 0.0001 ไมครอน ขจัดโลหะหนัก เชื้อไวรัส แบคทีเรีย สารเคมีตกค้างได้อย่างหมดจด',
        },
        {
          title: 'บริการ Cody ถึงบ้านฟรี',
          description: 'ผู้เชี่ยวชาญเข้าตรวจเช็ก ล้างระบบด้วยชุดเครื่องมือ Care Kit ฆ่าเชื้อทุก 2 เดือน',
        },
      ];
    })(),
    isPopular: row.is_popular !== undefined ? Boolean(row.is_popular) : true,
    isNew: Boolean(row.is_new),
    isPromo: Boolean(row.is_promo),
    promoText: row.promo_text || 'ฟรีค่าติดตั้ง + บริการ Cody ดูแลตลอดสัญญา',
    rating: Number(row.rating) || 4.9,
    reviewCount: Number(row.review_count) || 120,
    order: displayOrder,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class ProductService {
  /**
   * Fetch products with live Supabase query, falling back gracefully to mock data
   * if Supabase credentials are not yet configured or table is empty.
   */
  async getProductsWithStatus(params?: ProductFilterParams): Promise<DataFetchResult> {
    // 1. Check if Supabase client is configured
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('products').select('*');

        // Optional category filter if column exists
        if (params?.category && params.category !== 'all') {
          query = query.eq('category', params.category);
        }

        // Sorting
        if (params?.sortBy === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (params?.sortBy === 'price-desc') {
          query = query.order('price', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.warn('[ProductService] Supabase query error:', error.message);
          const isTableMissing = error.code === 'PGRST205' || error.message.includes('schema cache');
          const localOnly = localProductStorage.applyToProducts([]);
          const filtered = this.applyLocalFilters(localOnly, params);
          return {
            products: filtered,
            source: 'supabase',
            supabaseCount: 0,
            message: isTableMissing
              ? `เชื่อมต่อ Supabase สำเร็จแล้ว แต่ยังไม่พบตาราง public.products (รหัส: PGRST205) กรุณาสร้างตาราง products ใน Supabase SQL Editor`
              : `เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase: ${error.message}`,
          };
        }

        if (data && data.length > 0) {
          // Successfully fetched from Supabase table 'products'!
          const mapped = data.map((row, idx) => mapSupabaseRowToProduct(row, idx));
          const withLocal = localProductStorage.applyToProducts(mapped);
          const filtered = this.applyLocalFilters(withLocal, params);
          return {
            products: filtered,
            source: 'supabase',
            supabaseCount: data.length,
            message: `เชื่อมต่อ Supabase สำเร็จ ดึงข้อมูลสินค้าจริงจากตาราง products จำนวน ${data.length} รายการ`,
          };
        } else {
          // Supabase connected but table has 0 rows
          const localOnly = localProductStorage.applyToProducts([]);
          const filtered = this.applyLocalFilters(localOnly, params);
          return {
            products: filtered,
            source: 'supabase',
            supabaseCount: 0,
            message: 'เชื่อมต่อ Supabase สำเร็จ แต่ยังไม่มีข้อมูลในตาราง products (0 รายการ) สามารถกดปุ่มเพิ่มข้อมูลตัวอย่างด้านล่างได้',
          };
        }
      } catch (err: any) {
        console.error('[ProductService] Network exception fetching from Supabase:', err);
        const localOnly = localProductStorage.applyToProducts([]);
        const filtered = this.applyLocalFilters(localOnly, params);
        return {
          products: filtered,
          source: 'supabase',
          supabaseCount: 0,
          message: `ไม่สามารถติดต่อ Supabase ได้: ${err.message}`,
        };
      }
    }

    // 2. Supabase is not configured yet
    return {
      products: this.filterMockProducts(params),
      source: 'mock',
      supabaseCount: 0,
      message: 'ยังไม่ได้ระบุ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY (กำลังแสดงข้อมูลตัวอย่าง)',
    };
  }

  /**
   * Main method to get products
   */
  async getProducts(params?: ProductFilterParams): Promise<CowayProduct[]> {
    const result = await this.getProductsWithStatus(params);
    return result.products;
  }

  /**
   * Fetch single product by ID (checks local overrides first, then Supabase, then mock)
   */
  async getProductById(id: string): Promise<CowayProduct | null> {
    const strId = String(id);
    const overrides = localProductStorage.getOverrides();
    if (overrides[strId]) {
      return overrides[strId];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapSupabaseRowToProduct(data, 0);
        }
      } catch (err) {
        console.warn('[ProductService] Failed to get single product from Supabase:', err);
      }
    }

    // Fallback to mock dataset
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    return found || null;
  }

  /**
   * Insert 1-2 realistic sample products to Supabase 'products' table for connectivity test.
   * Matches the user's table schema: id, name, price, image_url.
   */
  async seedSampleProductsToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        message: 'กรุณาระบุ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน Secrets ของ AI Studio ก่อนทำการเพิ่มข้อมูล',
      };
    }

    try {
      const sampleItems = [
        {
          name: 'Coway Neo Plus (CHP-264L)',
          price: 790,
          image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
        },
        {
          name: 'Coway My Ice (CHPI-7520L)',
          price: 1290,
          image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
        },
      ];

      const { data, error } = await supabase
        .from('products')
        .insert(sampleItems)
        .select();

      if (error) {
        const isTableMissing = error.code === 'PGRST205' || error.message.includes('schema cache');
        return {
          success: false,
          message: isTableMissing
            ? `ยังไม่พบตาราง public.products ในฐานข้อมูล Supabase (PGRST205) กรุณาเข้าไปที่ Supabase Dashboard > SQL Editor เพื่อสร้างตาราง products ก่อน`
            : `เพิ่มข้อมูลไม่สำเร็จ: ${error.message} (กรุณาตรวจสอบว่ามีตาราง products และเปิดสิทธิ์ RLS Insert ให้ role anon หรือยัง)`,
        };
      }

      return {
        success: true,
        message: `เพิ่มข้อมูลตัวอย่าง 2 รายการลง Supabase เรียบร้อยแล้ว!`,
        count: data?.length || 2,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
      };
    }
  }

  /**
   * Helper to filter mock dataset
   */
  private filterMockProducts(params?: ProductFilterParams): CowayProduct[] {
    const rawMock = MOCK_PRODUCTS.map((p, idx) => ({ ...p, order: p.order || idx + 1 }));
    let results = localProductStorage.applyToProducts(rawMock);

    if (params?.activeOnly !== false) {
      results = results.filter((p) => p.isActive);
    }

    if (params?.category && params.category !== 'all') {
      results = results.filter((p) => p.category === params.category);
    }

    if (params?.waterType && params.waterType !== 'all') {
      results = results.filter(
        (p) => p.waterTypes && p.waterTypes.includes(params.waterType as any)
      );
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      results = results.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.modelCode.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
        );
      });
    }

    if (params?.sortBy === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (params?.sortBy === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
    }

    return results;
  }

  private applyLocalFilters(products: CowayProduct[], params?: ProductFilterParams): CowayProduct[] {
    let results = [...products];

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      results = results.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
        );
      });
    }

    if (params?.waterType && params.waterType !== 'all') {
      results = results.filter(
        (p) => p.waterTypes && p.waterTypes.includes(params.waterType as any)
      );
    }

    if (params?.sortBy === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (params?.sortBy === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    }

    return results;
  }
}

export const productService = new ProductService();
