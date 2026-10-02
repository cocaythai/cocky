export interface CustomerReviewItem {
  id: string;
  customerName: string;
  location: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  avatarUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  order?: number;
}

export const DEFAULT_CUSTOMER_REVIEWS: CustomerReviewItem[] = [
  {
    id: 'rev-1',
    customerName: 'คุณวราภรณ์ สุขสถิต',
    location: 'กรุงเทพมหานคร',
    productName: 'Coway Neo Plus',
    rating: 5,
    date: '15 กันยายน 2567',
    comment: 'ตัดสินใจถูกมากที่เลือก Coway Neo Plus มีน้ำร้อน น้ำเย็น พร้อมกดตลอดเวลา ไม่ต้องคอยกรอกน้ำใส่ตู้เย็นหรือต้มน้ำร้อนชงกาแฟอีกเลย Cody มาล้างถังตรงเวลาทุก 2 เดือน สุภาพมากค่ะ',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    order: 1,
  },
  {
    id: 'rev-2',
    customerName: 'คุณธนภัทร วัฒนากุล',
    location: 'เชียงใหม่',
    productName: 'Coway My Ice',
    rating: 5,
    date: '28 สิงหาคม 2567',
    comment: 'รุ่น My Ice คือดีงามเกินคาด น้ำแข็งสะอาดมากเป็นทรงกลวงเคี้ยวง่าย สะอาดจนมั่นใจว่าไม่มีสารปนเปื้อนแน่นอน เหมาะกับคนชอบดื่มกาแฟเย็นทุกเช้า จ่ายรายเดือนคุ้มกว่าไปซื้อน้ำแข็งถุงเยอะครับ',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    order: 2,
  },
  {
    id: 'rev-3',
    customerName: 'คุณพัชริดา เจริญรัตน์',
    location: 'นนทบุรี',
    productName: 'Coway Noble Air',
    rating: 5,
    date: '3 สิงหาคม 2567',
    comment: 'ดีไซน์สวยหรู วางในห้องรับแขกคือดูดีมาก แฟนเป็นภูมิแพ้ตื่นมาจามทุกเช้า พอเปิดตัวนี้ทิ้งไว้ อาการดีขึ้นชัดเจน กลิ่นอาหารในคอนโดหายเร็วมากค่ะ บริการเปลี่ยนไส้กรองถึงบ้านประทับใจสุดๆ',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    order: 3,
  },
  {
    id: 'rev-4',
    customerName: 'นพ. วิศรุต อัศวเมธา',
    location: 'ชลบุรี',
    productName: 'Coway Villaem II',
    rating: 5,
    date: '19 กรกฎาคม 2567',
    comment: 'ติดตั้งที่คลินิกและที่บ้าน น้ำรสชาติดีมาก สะอาดมาตรฐานระดับสากล WQA จริงๆ สมาชิกที่บ้าน 6 คน น้ำไม่เคยหมดถัง ระบบบริการ Cody Heart Service ทำได้มาตรฐานและสะอาดจริงจังครับ',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    order: 4,
  },
];
