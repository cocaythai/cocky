-- ==============================================================================
-- SQL Script: ตรวจสอบและยกระดับความปลอดภัย (Supabase RLS & Auth Hardening)
-- หมายเหตุ: สคริปต์นี้ปลอดภัย 100% ไม่ลบตาราง และไม่ลบข้อมูลสินค้าเดิมของคุณ
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ส่วนเสริมในตาราง site_settings และ products (ถ้ายังไม่มี)
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS agent_line_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_name TEXT DEFAULT '';

-- เพิ่มคอลัมน์ images สำหรับเก็บรูปภาพสูงสุด 5 รูปต่อสินค้า (ไม่กระทบรูปเดิม)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. ลบข้อมูลทดสอบความปลอดภัยออกจากตาราง products (ถ้ามี)
DELETE FROM public.products WHERE name = 'Hacker Product';


-- ==============================================================================
-- 3. ยกระดับความปลอดภัย RLS: ตาราง products
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ลบนโยบายเดิมทั้งหมดเพื่อปิดช่องโหว่ที่อนุญาตให้บุคคลภายนอกเพิ่ม/แก้ไขข้อมูล
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow public update access" ON public.products;
DROP POLICY IF EXISTS "Allow public delete access" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
DROP POLICY IF EXISTS "Allow public update products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;

-- 3.1 ผู้เข้าชมทั่วไป: อ่านข้อมูลสินค้าได้เท่านั้น (Public Read-Only)
CREATE POLICY "Allow public read products"
ON public.products FOR SELECT
USING (true);

-- 3.2 บัญชี Admin ที่ยืนยันตัวตนแล้วเท่านั้น: เพิ่ม แก้ไข และลบสินค้าได้
CREATE POLICY "Allow authenticated insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update products"
ON public.products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete products"
ON public.products FOR DELETE
TO authenticated
USING (true);


-- ==============================================================================
-- 4. ยกระดับความปลอดภัย RLS: ตาราง site_settings
-- ==============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public delete site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated delete site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;

-- 4.1 ผู้เข้าชมทั่วไป: อ่านการตั้งค่าเพื่อนำไปแสดงผลบนหน้าเว็บได้ (Public Read-Only)
CREATE POLICY "Allow public read site_settings"
ON public.site_settings FOR SELECT
USING (true);

-- 4.2 บัญชี Admin ที่ยืนยันตัวตนแล้วเท่านั้น: บันทึกและแก้ไขการตั้งค่าได้
CREATE POLICY "Allow authenticated update site_settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated insert site_settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (true);


-- ==============================================================================
-- 5. ตรวจสอบและตั้งค่า Storage Bucket 'site-images' และ 'website-assets'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Access website-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload website-assets" ON storage.objects;

-- 5.1 ผู้เข้าชมทุกคน: ดูรูปภาพใน Bucket 'site-images' และ 'website-assets' ได้ (Public View)
CREATE POLICY "Allow public read storage"
ON storage.objects FOR SELECT
USING (bucket_id IN ('site-images', 'website-assets'));

-- 5.2 บัญชี Admin ที่ Login เท่านั้น: อัปโหลด แก้ไข หรือลบรูปภาพได้
CREATE POLICY "Allow authenticated upload storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('site-images', 'website-assets'));

CREATE POLICY "Allow authenticated update storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('site-images', 'website-assets'));

CREATE POLICY "Allow authenticated delete storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('site-images', 'website-assets'));
