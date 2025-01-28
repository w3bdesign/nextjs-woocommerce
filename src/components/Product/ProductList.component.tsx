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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">
            {title} <span className="text-gray-500">({filteredProducts.length})</span>
          </h1>

          <div className="flex items-center gap-4">
            <label className="text-sm">Vis produkter:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-1"
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
