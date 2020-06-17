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
        <span>
        <svg
          id="xsvg"
          onClick={() => {
            //setisExpanded(!isExpanded);
          }}
         
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-x"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
          
        </span>
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
