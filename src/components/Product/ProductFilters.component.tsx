import { Dispatch, SetStateAction } from 'react';

interface ProductFiltersProps {
  selectedSizes: string[];
  setSelectedSizes: Dispatch<SetStateAction<string[]>>;
  selectedColors: string[];
  setSelectedColors: Dispatch<SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
}

const ProductFilters = ({
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
}: ProductFiltersProps) => {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Svart', class: 'bg-black' },
    { name: 'Brun', class: 'bg-brown-500' },
    { name: 'Beige', class: 'bg-[#D2B48C]' },
    { name: 'Grå', class: 'bg-gray-500' },
    { name: 'Hvit', class: 'bg-white border border-gray-300' },
    { name: 'Blå', class: 'bg-blue-500' }
  ];

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
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">T-Shirts</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Gensere</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Singlet</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Skjorter</span>
            </label>
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
