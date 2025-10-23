import { Product, ProductType } from '@/types/product';
import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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
    .filter(
      (color, index, self) =>
        index === self.findIndex((c) => c.slug === color.slug),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const colors = availableColors.map((color) => ({
    name: color.name,
    class: `bg-${color.slug}-500`,
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
      <div className="bg-white px-8 pb-8 sm:px-6 sm:pb-6 rounded-lg shadow-sm">
        <div className="mb-8">
          <h3 className="font-semibold mb-4">PRODUCT TYPE</h3>
          <div className="space-y-2">
            {productTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={type.id}
                  checked={type.checked}
                  onCheckedChange={() => toggleProductType(type.id)}
                />
                <Label
                  htmlFor={type.id}
                  className="text-base font-normal cursor-pointer"
                >
                  {type.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">PRICE</h3>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={(value) => setPriceRange([value[0], value[1]])}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <span className="text-sm">kr {priceRange[0]}</span>
            <span className="text-sm">kr {priceRange[1]}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">SIZE</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                onClick={() => toggleSize(size)}
                variant="filter"
                data-selected={selectedSizes.includes(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-4">COLOR</h3>
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

        <Button onClick={resetFilters} variant="reset">
          Reset filters
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
