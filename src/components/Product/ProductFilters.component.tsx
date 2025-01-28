import { Dispatch, SetStateAction } from 'react';

interface ProductType {
  id: string;
  name: string;
  checked: boolean;
}

interface Product {
  allPaSizes?: {
    nodes: {
      name: string;
    }[];
  };
  allPaColors?: {
    nodes: {
      name: string;
    }[];
  };
}

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
}: ProductFiltersProps) => {
  // Get unique sizes from all products
  const sizes = Array.from(new Set(
    products.flatMap((product: Product) => 
      product.allPaSizes?.nodes.map((node: { name: string }) => node.name) || []
    )
  )).sort() as string[];
  // Get unique colors from all products
  const availableColors = Array.from(new Set(
    products.flatMap((product: Product) => 
      product.allPaColors?.nodes.map((node: { name: string }) => node.name) || []
    )
  )).sort() as string[];

  // Map color names to their CSS classes
  const colorMap: { [key: string]: string } = {
    'Svart': 'bg-black',
    'Brun': 'bg-brown-500',
    'Beige': 'bg-[#D2B48C]',
    'Grå': 'bg-gray-500',
    'Hvit': 'bg-white border border-gray-300',
    'Blå': 'bg-blue-500'
  };

  const colors = availableColors.map(colorName => ({
    name: colorName,
    class: colorMap[colorName] || 'bg-gray-300' // Fallback color if not in map
  }));

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white p-6 rounded-lg shadow-sm">
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
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
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
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 border rounded ${
                  selectedSizes.includes(size)
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">FARGE</h3>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`w-8 h-8 rounded-full ${color.class} ${
                  selectedColors.includes(color.name)
                    ? 'ring-2 ring-offset-2 ring-gray-900'
                    : ''
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
