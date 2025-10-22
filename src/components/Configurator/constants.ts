import { Truck, RotateCcw, Settings, Shield } from 'lucide-react';

export const STYLE_OPTIONS = [
  { id: 'frame', label: 'Frame' },
  { id: 'grid', label: 'Grid' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'mosaic', label: 'Mosaic' },
  { id: 'pattern', label: 'Pattern' },
] as const;

export const COLOR_PALETTE = [
  '#FFFFFF',
  '#F5F5F5',
  '#E5E5E5',
  '#000000',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#84CC16',
  '#06B6D4',
  '#8B4513',
  '#A78BFA',
  '#FBBF24',
] as const;

export const BENEFIT_CARDS = [
  {
    id: 'delivery',
    title: 'Delivery Included',
    description: 'To every place in Europe',
    icon: Truck,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'returns',
    title: '100 Days Free Returns',
    description: 'Or return within 100 days',
    icon: RotateCcw,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'assembly',
    title: 'Assembly Service',
    description: 'Available in Poland',
    icon: Settings,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'warranty',
    title: '10 Year Warranty',
    description: 'Designed for years',
    icon: Shield,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
] as const;

export const PRICING_DATA = {
  originalPrice: '3067 kr',
  currentPrice: '1963 kr',
  savings: '1104 kr',
  lowestPrice: '1806 kr',
  onSale: true,
} as const;

export const REVIEW_DATA = {
  rating: 4.9,
  reviewCount: 9368,
  source: 'mebl.com',
} as const;
