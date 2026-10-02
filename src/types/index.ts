export type ProductCategoryType = 'water' | 'air' | 'bidet' | 'mattress';
export type ProductCategory = 'all' | ProductCategoryType;

export type WaterType = 'hot' | 'cold' | 'room' | 'ice';

export interface SubscriptionOption {
  years: number;
  monthlyPrice: number;
  label: string;
  badge?: string;
  codyService: string;
}

export interface ProductHighlight {
  title: string;
  description: string;
}

/**
 * Standard Product Data Model
 * Designed for direct Supabase database table mapping ('products' table)
 */
export interface CowayProduct {
  // Required Core Model Fields (As specified in requirement 2)
  id: string;
  name: string;
  description: string;
  price: number; // Starting monthly subscription price (THB/month)
  image: string;
  category: ProductCategoryType;
  features: string[];
  isActive: boolean; // Controls whether product is published/visible

  // Extended Domain Specification Fields
  modelCode: string;
  categoryLabel: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  startingMonthlyPrice: number;
  cashPrice: number;
  subscriptionOptions: SubscriptionOption[];
  waterTypes?: WaterType[];
  tankCapacity?: string;
  filtrationSystem?: string;
  coverageArea?: string;
  dimensions: string;
  weight: string;
  powerConsumption: string;
  codyCycle: string;
  keyFeatures: string[];
  highlights: ProductHighlight[];
  isPopular?: boolean;
  isNew?: boolean;
  isPromo?: boolean;
  promoText?: string;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Filter and query parameters for Product Data Access
 */
export interface ProductFilterParams {
  category?: ProductCategory;
  waterType?: WaterType | 'all';
  searchQuery?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc';
  activeOnly?: boolean;
}

export interface InquiryItem {
  product: CowayProduct;
  selectedOption: SubscriptionOption;
  quantity: number;
}

export interface ConsultationForm {
  fullName: string;
  phoneNumber: string;
  lineId: string;
  province: string;
  interestedCategory: string;
  interestedModel?: string;
  paymentPreference: 'subscription' | 'cash';
  notes?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  location: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}
