import { useState } from 'react';
import { v4 } from 'uuid';

import SVGCloseX from 'components/SVG/SVGCloseX.component';

const CartItem = ({
  item,
  products,
  updateCartProcessing,
  handleRemoveProductClick,
  updateCart,
}) => {
  const [productCount, setProductCount] = useState(item.qty);

  return (
    <tr className="bg-gray-100">
      <td className="px-4 py-2 border">
        <SVGCloseX />
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
        <input type="number" min="1" value={productCount} />
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
