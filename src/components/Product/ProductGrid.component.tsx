import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TypographyH2,
  TypographyLarge,
  TypographySmall,
} from '@/components/ui/Typography.component';
import { useProductFilters } from '@/hooks/useProductFilters';
import { Product } from '@/types/product';
import { ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard.component';
import ProductFilters from './ProductFilters.component';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
  showSorting?: boolean;
  showTitle?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Unified product grid component with optional filtering and sorting
 * Replaces both DisplayProducts and ProductList components
 *
 * @param products - Array of products to display
 * @param title - Optional title (shows count if provided)
 * @param showFilters - Show left sidebar filters (default: false)
 * @param showSorting - Show sort dropdown (default: false)
 * @param showTitle - Show title with product count (default: true if title provided)
 * @param columns - Responsive column configuration
 */
const ProductGrid = ({
  products,
  title,
  showFilters = false,
  showSorting = false,
  showTitle = true,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}: ProductGridProps) => {
  // Always call hooks (React rules), but only use filters if needed
  const filters = useProductFilters(products);

  const displayProducts =
    showFilters || showSorting ? filters.filterProducts(products) : products;

  // Generate responsive grid classes
  const gridClasses = `grid gap-8 ${
    columns.sm ? `grid-cols-${columns.sm}` : 'grid-cols-1'
  } ${columns.md ? `md:grid-cols-${columns.md}` : ''} ${
    columns.lg ? `lg:grid-cols-${columns.lg}` : ''
  } ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}`.trim();

  if (!products?.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <TypographyLarge className="text-gray-500">
          No products found
        </TypographyLarge>
      </div>
    );
  }

  return (
    <div className={showFilters ? 'flex flex-col md:flex-row gap-8' : ''}>
      {/* Filters Sidebar (optional) */}
      {showFilters && (
        <ProductFilters
          selectedSizes={filters.selectedSizes}
          setSelectedSizes={filters.setSelectedSizes}
          selectedColors={filters.selectedColors}
          setSelectedColors={filters.setSelectedColors}
          priceRange={filters.priceRange}
          setPriceRange={filters.setPriceRange}
          productTypes={filters.productTypes}
          toggleProductType={filters.toggleProductType}
          products={products}
          resetFilters={filters.resetFilters}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          priceStep={filters.priceStep}
          isCalculatingRange={filters.isCalculatingRange}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with optional title and sorting */}
        {(showTitle && title) || showSorting ? (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            {showTitle && title && (
              <TypographyH2 className="text-center sm:text-left">
                {title}{' '}
                <span className="text-gray-500">
                  ({displayProducts.length})
                </span>
              </TypographyH2>
            )}

            {showSorting && (
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
                <TypographySmall className="font-medium">
                  Sort by:
                </TypographySmall>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="min-w-[180px] justify-between"
                    >
                      {filters.sortBy === 'popular' && 'Popular'}
                      {filters.sortBy === 'price-low' && 'Price: Low to High'}
                      {filters.sortBy === 'price-high' && 'Price: High to Low'}
                      {filters.sortBy === 'newest' && 'Newest'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuRadioGroup
                      value={filters.sortBy}
                      onValueChange={filters.setSortBy}
                    >
                      <DropdownMenuRadioItem value="popular">
                        Popular
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="price-low">
                        Price: Low to High
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="price-high">
                        Price: High to Low
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="newest">
                        Newest
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ) : null}

        {/* Product Grid */}
        <div className={gridClasses}>
          {displayProducts.map((product: Product) => (
            <ProductCard
              key={product.databaseId}
              databaseId={product.databaseId}
              name={product.name}
              price={product.price}
              regularPrice={product.regularPrice}
              salePrice={product.salePrice}
              onSale={product.onSale}
              slug={product.slug}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
