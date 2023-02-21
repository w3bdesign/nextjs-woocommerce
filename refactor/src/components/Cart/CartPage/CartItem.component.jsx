/*eslint complexity: ["error", 6]*/

import { useState } from 'react';

//import SVGX from 'components/SVG/SVGX.component';
import { paddedPrice, handleQuantityChange } from '@/utils/functions/functions';

const CartItem = ({
  item,
  products,
  handleRemoveProductClick,
  updateCart,
  updateCartProcessing,
}) => {
  const [productCount, setProductCount] = useState(item.qty);
  const totalPrice = paddedPrice(item.totalPrice, 'kr');

  return (
    <tr className="bg-gray-100">
      <td className="px-4 py-2 border">SVGX</td>
      <td className="px-4 py-2 border">
        <img
          className="w-[70px]"
          src={item.image.sourceUrl}
          srcSet={item.image.srcSet}
          alt={item.image.title}
        />
      </td>
      <td className="px-4 py-2 border">{item.name}</td>
      <td className="px-4 py-2 border">
        kr {'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
      </td>
      <td className="px-4 py-2 border">
        <input
          className="w-12"
          type="number"
          min="1"
          defaultValue={productCount}
          onChange={(event) =>
            handleQuantityChange(
              event,
              item.cartKey,
              products,
              updateCart,
              updateCartProcessing,
              setProductCount
            )
          }
        />
      </td>
      <td className="px-4 py-2 border">
        {'string' !== typeof item.totalPrice
          ? totalPrice.toFixed(2)
          : totalPrice}
      </td>
    </tr>
  );
};

export default CartItem;
