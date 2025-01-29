import { Dispatch, SetStateAction } from 'react';
import { Product, ProductType } from '@/types/product';
import Button from '@/components/UI/Button.component';

interface ProductFiltersProps {
  selectedSizes: string[];
  setSelectedSizes: Dispatch<SetStateAction<string[]>>;
  selectedColors: string[];
  setSelectedColors: Dispatch<SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  productTypes: ProductType[];
  toggleProductType: (id: string) => void;
  products: Product[];
  resetFilters: () => void;
}

const ProductFilters = ({
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  productTypes,
  toggleProductType,
  products,
  resetFilters,
}: ProductFiltersProps) => {
  // Get unique sizes from all products
  const sizes = Array.from(
    new Set(
      products.flatMap(
        (product: Product) =>
          product.allPaSizes?.nodes.map(
            (node: { name: string }) => node.name,
          ) || [],
      ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  // Get unique colors from all products
  const availableColors = products
    .flatMap((product: Product) => product.allPaColors?.nodes || [])
    .filter((color, index, self) => 
      index === self.findIndex((c) => c.slug === color.slug)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const colors = availableColors.map((color) => ({
    name: color.name,
    class: `bg-${color.slug}-500`
  }));

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white p-8 sm:p-6 rounded-lg shadow-sm">
        <div className="mb-8">
          <h3 className="font-semibold mb-4">PRODUKT TYPE</h3>
          <div className="space-y-2">
            {productTypes.map((type) => (
              <label key={type.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={type.checked}
                  onChange={() => toggleProductType(type.id)}
                />
                <span className="ml-2">{type.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">PRIS</h3>
            <label htmlFor="price-range" className="sr-only">Pris</label>
            <input
              id="price-range"
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-full"
            />
          <div className="flex justify-between mt-2">
            <span>kr {priceRange[0]}</span>
            <span>kr {priceRange[1]}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">STØRRELSE</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                handleButtonClick={() => toggleSize(size)}
                variant="filter"
                selected={selectedSizes.includes(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">FARGE</h3>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  color.class
                } ${
                  selectedColors.includes(color.name)
                    ? 'ring-2 ring-offset-2 ring-gray-900'
                    : ''
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <Button
          handleButtonClick={resetFilters}
          variant="reset"
        >
          Resett filter
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
