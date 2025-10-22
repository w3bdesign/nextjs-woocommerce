import { render, screen } from '@testing-library/react';
import PricingSection from '../PricingSection.component';
import { PRICING_DATA } from '../constants';

describe('PricingSection', () => {
  describe('With mock data (no product provided)', () => {
    it('should render mock pricing data when product is undefined', () => {
      render(<PricingSection />);

      expect(screen.getByText(PRICING_DATA.originalPrice)).toBeInTheDocument();
      expect(screen.getByText(PRICING_DATA.currentPrice)).toBeInTheDocument();
      expect(screen.getByText(PRICING_DATA.savings)).toBeInTheDocument();
    });

    it('should display on-sale styling when mock data has onSale=true', () => {
      render(<PricingSection />);

      const container = screen
        .getByText('Original')
        .closest('.space-y-2')?.parentElement;
      expect(container).toHaveClass('bg-gradient-to-r');
    });

    it('should display original and save prices for mock data', () => {
      render(<PricingSection />);

      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
    });
  });

  describe('With product data - on sale', () => {
    const saleProduct = {
      price: '$299.99',
      regularPrice: '$399.99',
      salePrice: '$299.99',
      onSale: true,
    };

    it('should render product prices correctly when on sale', () => {
      render(<PricingSection product={saleProduct} />);

      expect(screen.getByText('$399.99')).toBeInTheDocument(); // original
      expect(screen.getByText('$299.99')).toBeInTheDocument(); // sale price
    });

    it('should display original and save sections when on sale', () => {
      render(<PricingSection product={saleProduct} />);

      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should display on-sale styling (orange gradient) when on sale', () => {
      render(<PricingSection product={saleProduct} />);

      const container = screen
        .getByText('Original')
        .closest('.space-y-2')?.parentElement;
      expect(container).toHaveClass(
        'bg-gradient-to-r',
        'from-orange-50',
        'to-red-50',
      );
    });

    it('should use salePrice when available and onSale=true', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: '$249.99',
        onSale: true,
      };
      render(<PricingSection product={product} />);

      // Current price should show sale price, not regular price
      expect(screen.getByText('$249.99')).toBeInTheDocument();
    });

    it('should add aria-labels for accessibility', () => {
      render(<PricingSection product={saleProduct} />);

      expect(screen.getByLabelText(/Original price/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Current price/)).toBeInTheDocument();
    });
  });

  describe('With product data - not on sale', () => {
    const regularProduct = {
      price: '$299.99',
      regularPrice: '$299.99',
      salePrice: null,
      onSale: false,
    };

    it('should render only current price when not on sale', () => {
      render(<PricingSection product={regularProduct} />);

      expect(screen.getByText('$299.99')).toBeInTheDocument();
      expect(screen.queryByText('Original')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should display neutral styling (gray) when not on sale', () => {
      render(<PricingSection product={regularProduct} />);

      const container = screen
        .getByText('Price')
        .closest('.space-y-2')?.parentElement;
      expect(container).toHaveClass('bg-gray-50');
    });

    it('should use price when regularPrice matches', () => {
      render(<PricingSection product={regularProduct} />);

      expect(screen.getByText('$299.99')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty price strings', () => {
      const product = {
        price: '',
        regularPrice: '',
        salePrice: null,
        onSale: false,
      };
      render(<PricingSection product={product} />);

      // Should render without crashing, showing empty price
      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('should handle undefined prices', () => {
      const product = {
        price: undefined,
        regularPrice: undefined,
        salePrice: undefined,
        onSale: false,
      };
      render(<PricingSection product={product} />);

      // Should render without crashing
      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('should handle null prices', () => {
      const product = {
        price: null,
        regularPrice: null,
        salePrice: null,
        onSale: false,
      };
      render(<PricingSection product={product} />);

      // Should render without crashing
      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('should prioritize salePrice over price when on sale', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: '$199.99',
        onSale: true,
      };
      render(<PricingSection product={product} />);

      expect(
        screen.getByLabelText(/Current price \$199.99/),
      ).toBeInTheDocument();
    });

    it('should use price when salePrice is null even if on sale flag is true', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: null,
        onSale: true,
      };
      render(<PricingSection product={product} />);

      expect(
        screen.getByLabelText(/Current price \$299.99/),
      ).toBeInTheDocument();
    });

    it('should use regularPrice as display original when available', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: '$299.99',
        onSale: true,
      };
      render(<PricingSection product={product} />);

      expect(
        screen.getByLabelText(/Original price \$399.99/),
      ).toBeInTheDocument();
    });
  });

  describe('Styling and classNames', () => {
    it('should use success color for Save section', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: '$299.99',
        onSale: true,
      };
      render(<PricingSection product={product} />);

      const saveElement = screen.getByText('Save');
      expect(saveElement).toHaveClass('text-success');
    });

    it('should use semantic foreground color for Price label', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$299.99',
        onSale: false,
      };
      render(<PricingSection product={product} />);

      const priceLabel = screen.getByText('Price');
      expect(priceLabel).toHaveClass('text-foreground');
    });

    it('should have correct text sizes', () => {
      const product = {
        price: '$299.99',
        regularPrice: '$399.99',
        salePrice: '$299.99',
        onSale: true,
      };
      render(<PricingSection product={product} />);

      expect(screen.getByText('Original')).toHaveClass('text-xs');
      expect(screen.getByText('Save')).toHaveClass('text-xs');
    });
  });
});
