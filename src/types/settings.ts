export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteTagline: string;
  logoUrl?: string;
  phoneNumber: string;
  phoneDisplay: string;
  lineId: string;
  lineUrl: string;
  agentLineUrl?: string;
  facebookUrl?: string;
  facebookName?: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  contactHeading: string;
  contactSubtitle: string;
  contactAddress: string;
  contactHours: string;
  banners: HeroBanner[];
  updatedAt?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'main',
  siteName: 'Coway Thailand (Official Partner)',
  siteTagline: 'ผู้นำนวัตกรรมเครื่องกรองน้ำและเครื่องฟอกอากาศอันดับ 1 จากเกาหลี',
  logoUrl: '',
  phoneNumber: '02-000-0000',
  phoneDisplay: '02-000-0000',
  lineId: '@cowaythailand',
  lineUrl: 'https://line.me/ti/p/~@cowaythailand',
  agentLineUrl: 'https://line.me/ti/p/~@cowaythailand',
  facebookUrl: 'https://facebook.com/cowaythailand',
  facebookName: 'Coway Thailand Official Partner',
  heroBadge: 'Coway Official Subscription Partner',
  heroTitle: 'เปลี่ยนน้ำดื่มให้สะอาด บริสุทธิ์ ด้วยระบบ Subscription รายเดือน',
  heroSubtitle: 'เริ่มต้นเพียงหลักร้อยต่อเดือน ฟรีบริการ Cody ดูแลล้างระบบและเปลี่ยนไส้กรองแท้ถึงบ้านตลอดสัญญา ไม่มีค่าใช้จ่ายแอบแฝง',
  contactHeading: 'ปรึกษาผู้เชี่ยวชาญ Coway ได้ทุกวัน',
  contactSubtitle: 'สอบถามข้อมูลโปรโมชั่น เลือกรุ่นที่เหมาะกับคุณ หรือนัดหมายติดตั้งฟรีทั่วประเทศ',
  contactAddress: 'กรุงเทพมหานครและปริมณฑล พร้อมศูนย์บริการและช่างผู้ชำนาญการติดตั้งฟรีทั่วประเทศ',
  contactHours: 'จันทร์ - อาทิตย์ 08:30 - 20:00 น. (ทุกวันไม่มีวันหยุด)',
  banners: [
    {
      id: 'banner-1',
      title: 'Coway Neo Plus นวัตกรรมน้ำสะอาด RO อันดับ 1',
      subtitle: 'ผ่อนเบาเพียง 790.-/เดือน ฟรีไส้กรองและบริการ Cody ดูแลถึงบ้านตลอด 5 ปีเต็ม',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'ดูรุ่นยอดนิยมนี้',
      buttonLink: '#products',
      isActive: true,
      order: 1,
    },
    {
      id: 'banner-2',
      title: 'Coway My Ice สดชื่นสะใจด้วยน้ำแข็งบริสุทธิ์ในตัว',
      subtitle: 'น้ำร้อน น้ำเย็น น้ำปกติ พร้อมเครื่องทำน้ำแข็ง UV ฆ่าเชื้อ สะอาดทุกแก้ว',
      imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'สัมผัสรุ่น My Ice',
      buttonLink: '#products',
      isActive: true,
      order: 2,
    },
  ],
};
