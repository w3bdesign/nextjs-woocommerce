import { useState } from 'react';

import SVGX from 'components/SVG/SVGX.component';

const CartItem = ({ item, products, handleRemoveProductClick }) => {
  const [productCount, setProductCount] = useState(item.qty);

  return (
    <tr className="bg-gray-100">
      <td className="px-4 py-2 border">
        <SVGX
          cartKey={item.cartKey}
          handleRemoveProductClick={handleRemoveProductClick}
          products={products}
        />
      </td>
      <td className="px-4 py-2 border">
        <img
          width="64"
          src={item.image.sourceUrl}
          srcSet={item.image.srcSet}
          alt={item.image.title}
        />
      </td>

      <td className="px-4 py-2 border">{item.name}</td>

      <td className="px-4 py-2 border">
        {'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
      </td>

      <td className="px-4 py-2 border">
        <input
          className="w-12"
          type="number"
          min="1"
          defaultValue={productCount}
          onChange={() => {
            console.log('Changed quantity ...');
          }}
        />
      </td>

      <td className="px-4 py-2 border">
        {'string' !== typeof item.totalPrice
          ? item.totalPrice.toFixed(2)
          : item.totalPrice}
      </td>
    </tr>
  );
};

export default CartItem;
