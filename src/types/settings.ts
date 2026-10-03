import { Article } from './article';
import { KnowledgeTip, DEFAULT_KNOWLEDGE_TIPS } from '../data/defaultKnowledge';
import { CustomerReviewItem, DEFAULT_CUSTOMER_REVIEWS } from '../data/defaultReviews';
import { DEFAULT_ARTICLES } from '../data/defaultArticles';
import heroImgFallback from '../assets/images/hero_coway_kitchen_1790923059004.jpg';
import neoPlusImg from '../assets/images/coway_neo_plus_1790923072942.jpg';
import myIceImg from '../assets/images/coway_my_ice_1790923084460.jpg';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  image_url?: string; // รองรับ snake_case ตามข้อกำหนดของ Database
  buttonText: string;
  button_text?: string;
  buttonLink: string;
  button_link?: string;
  isActive: boolean;
  is_active?: boolean; // รองรับ snake_case ตามข้อกำหนดของ Database
  order: number;
}

export type { Article, KnowledgeTip, CustomerReviewItem };

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
  articles?: Article[];
  knowledgeTips?: KnowledgeTip[];
  customerReviews?: CustomerReviewItem[];
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
      imageUrl: neoPlusImg,
      image_url: neoPlusImg,
      buttonText: 'ดูรุ่นยอดนิยมนี้',
      button_text: 'ดูรุ่นยอดนิยมนี้',
      buttonLink: '#products',
      button_link: '#products',
      isActive: true,
      is_active: true,
      order: 1,
    },
    {
      id: 'banner-2',
      title: 'Coway My Ice สดชื่นสะใจด้วยน้ำแข็งบริสุทธิ์ในตัว',
      subtitle: 'น้ำร้อน น้ำเย็น น้ำปกติ พร้อมเครื่องทำน้ำแข็ง UV ฆ่าเชื้อ สะอาดทุกแก้ว',
      imageUrl: myIceImg,
      image_url: myIceImg,
      buttonText: 'สัมผัสรุ่น My Ice',
      button_text: 'สัมผัสรุ่น My Ice',
      buttonLink: '#products',
      button_link: '#products',
      isActive: true,
      is_active: true,
      order: 2,
    },
    {
      id: 'banner-3',
      title: 'Coway Subscription ดื่มน้ำสะอาดไม่อั้นทุกวัน',
      subtitle: 'ไม่ต้องแบกแพ็คน้ำ ไม่ต้องเปลี่ยนไส้กรองเอง ทีมงาน Cody ดูแลครบวงจร',
      imageUrl: heroImgFallback,
      image_url: heroImgFallback,
      buttonText: 'ดูโปรโมชั่นทั้งหมด',
      button_text: 'ดูโปรโมชั่นทั้งหมด',
      buttonLink: '#products',
      button_link: '#products',
      isActive: true,
      is_active: true,
      order: 3,
    },
  ],
  articles: DEFAULT_ARTICLES,
  knowledgeTips: DEFAULT_KNOWLEDGE_TIPS,
  customerReviews: DEFAULT_CUSTOMER_REVIEWS,
};
