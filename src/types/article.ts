export interface Article {
  id: string;
  title: string;
  category: 'water' | 'health' | 'service' | 'air';
  categoryLabel: string;
  summary: string;
  readTime: string;
  date: string;
  imageUrl: string;
  keyPoints: string[];
  content: string[];
  isActive?: boolean;
  order?: number;
}
