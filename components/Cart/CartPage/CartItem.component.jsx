import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import SVGX from 'components/SVG/SVGX.component';
import { getUpdatedItems } from 'utils/functions/functions';

const CartItem = ({
  item,
  products,
  handleRemoveProductClick,
  updateCart,
  updateCartProcessing,
}) => {
  const [productCount, setProductCount] = useState(item.qty);

  /*
   * When user changes the quantity, update the cart in localStorage
   * Also update the cart in the global Context
   *
   * @param {Object} event cartKey
   *
   * @return {void}
   */
  const handleQuantityChange = (event, cartKey) => {
    if (process.browser) {
      event.stopPropagation();
      // Return if the previous update cart mutation request is still processing
      if (updateCartProcessing) {
        return;
      }
      // If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
      const newQty = event.target.value ? parseInt(event.target.value) : 1;

      // Set the new quantity in state.
      setProductCount(newQty);
      if (products.length) {
        const updatedItems = getUpdatedItems(products, newQty, cartKey);

        updateCart({
          variables: {
            input: {
              clientMutationId: uuidv4(),
              items: updatedItems,
            },
          },
        });
      }
    }
  };
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
        kr{'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
      </td>
      <td className="px-4 py-2 border">
        <input
          className="w-12"
          type="number"
          min="1"
          defaultValue={productCount}
          onChange={(event) => handleQuantityChange(event, item.cartKey)}
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
