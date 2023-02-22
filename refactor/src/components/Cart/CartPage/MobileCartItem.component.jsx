/*eslint complexity: ["error", 6]*/

import { useState } from 'react';

import SVGX from 'components/SVG/SVGX.component';
import { handleQuantityChange } from 'utils/functions/functions';

const MobileCartItem = ({
  item,
  products,
  handleRemoveProductClick,
  updateCart,
  updateCartProcessing,
}) => {
  const [productCount, setProductCount] = useState(item.qty);

  return (
    <tr className="flex flex-col mb-2 border border-gray-300 sm:mb-0">
      <td className="h-12 p-3">
        <SVGX
          cartKey={item.cartKey}
          handleRemoveProductClick={handleRemoveProductClick}
          products={products}
        />
      </td>
      <td className="h-12 p-3">{item.name}</td>
      <td className="h-12 p-3">
        kr
        {'string' === typeof item.price ? item.price : item.price.toFixed(2)}
      </td>
      <td className="h-12 p-3">
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
      <td className="h-12 p-3">
        {'string' === typeof item.totalPrice
          ? item.totalPrice
          : item.totalPrice.toFixed(2)}
      </td>
    </tr>
  );
};

export default MobileCartItem;
