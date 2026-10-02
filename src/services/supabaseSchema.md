# Coway Product Data Model & Supabase Schema Blueprint

โครงสร้างฐานข้อมูลนี้ออกแบบมาให้สอดคล้องกับ `Product Data Model` (`CowayProduct` ใน `src/types/index.ts`) และสามารถสร้าง Table บน Supabase ได้ทันทีในขั้นตอนต่อไป

---

## 1. Supabase SQL Table Definition (`products`)

```sql
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('water', 'air', 'bidet', 'mattress')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- รายละเอียดสเปกเพิ่มเติม (Extended Domain Specifications)
  model_code TEXT NOT NULL,
  category_label TEXT NOT NULL,
  tagline TEXT,
  short_desc TEXT,
  starting_monthly_price NUMERIC NOT NULL,
  cash_price NUMERIC NOT NULL,
  subscription_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  water_types TEXT[] DEFAULT '{}',
  tank_capacity TEXT,
  filtration_system TEXT,
  coverage_area TEXT,
  dimensions TEXT,
  weight TEXT,
  power_consumption TEXT,
  cody_cycle TEXT,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_promo BOOLEAN DEFAULT false,
  promo_text TEXT,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index สำหรับค้นหาและกรองข้อมูลอย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
```

---

## 2. วิธีเชื่อมต่อ Supabase ใน `src/services/productService.ts`

เมื่อต้องการเชื่อมต่อ Supabase จริง เพียงเปิดไฟล์ `src/services/productService.ts` แล้วสลับจากการอ่าน `MOCK_PRODUCTS` เป็นการเรียกผ่าน Supabase Client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

class ProductService {
  async getProducts(params?: ProductFilterParams): Promise<CowayProduct[]> {
    let query = supabase.from('products').select('*').eq('is_active', true);

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    if (params?.sortBy === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (params?.sortBy === 'price-desc') {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CowayProduct[];
  }

  async getProductById(id: string): Promise<CowayProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data as CowayProduct;
  }
}
```

---

## 3. สรุปจุดเด่นของโครงสร้างนี้
1. **Zero UI coupling**: หน้าจอ Component (`ProductCatalog`, `ProductCard`, `ProductDetailModal`, `WaterSavingsCalculator`) ไม่ได้รับรู้ว่าข้อมูลมาจาก Mock หรือ Supabase
2. **Centralized Data**: ข้อมูลสินค้าทั้งหมดเก็บไว้ที่ `src/data/mockProducts.ts` เพียงจุดเดียว
3. **Data Model ครบตามข้อกำหนด**: มี `id`, `name`, `description`, `price`, `image`, `category`, `features`, `isActive` ครบถ้วนทุกรายการ
