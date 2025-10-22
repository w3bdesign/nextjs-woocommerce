import type { ComponentType } from 'react';
import type { ModelConfig } from '@/types/configurator';

export interface EnhancedControlsProps {
  modelConfig: ModelConfig;
  product?: {
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    onSale?: boolean;
  };
}

export interface PricingData {
  originalPrice: string;
  currentPrice: string;
  savings: string;
  lowestPrice: string;
}

export interface StyleOption {
  id: string;
  label: string;
}

export interface BenefitCard {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

export interface ReviewData {
  rating: number;
  reviewCount: number;
  source: string;
}
