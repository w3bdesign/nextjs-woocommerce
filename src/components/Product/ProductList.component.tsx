import { Product } from '@/types/product';
import { useProductFilters } from '@/hooks/useProductFilters';
import ProductCard from './ProductCard.component';
import ProductFilters from './ProductFilters.component';

interface ProductListProps {
  products: Product[];
  title: string;
}

const ProductList = ({ products, title }: ProductListProps) => {
  const {
    sortBy,
    setSortBy,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    priceRange,
    setPriceRange,
    productTypes,
    toggleProductType,
    resetFilters,
    filterProducts
  } = useProductFilters(products);

  const filteredProducts = filterProducts(products);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <ProductFilters
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        productTypes={productTypes}
        toggleProductType={toggleProductType}
        products={products}
        resetFilters={resetFilters}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
            {title} <span className="text-gray-500">({filteredProducts.length})</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
            <label htmlFor="sort-select" className="text-sm font-medium">Sortering:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[140px] border rounded-md px-3 py-1.5 text-sm"
            >
              <option value="popular">Populær</option>
              <option value="price-low">Pris: Lav til Høy</option>
              <option value="price-high">Pris: Høy til Lav</option>
              <option value="newest">Nyeste</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product: Product) => (
            <ProductCard
              key={product.databaseId}
              databaseId={product.databaseId}
              name={product.name}
              price={product.price}
              slug={product.slug}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
