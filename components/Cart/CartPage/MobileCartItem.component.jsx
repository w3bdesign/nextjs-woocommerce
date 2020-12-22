import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import SVGX from 'components/SVG/SVGX.component';
import { getUpdatedItems } from 'utils/functions/functions';

const MobileCartItem = ({
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
    <>
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
          {'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
        </td>
        <td className="h-12 p-3">
          <input
            className="w-12"
            type="number"
            min="1"
            defaultValue={productCount}
            onChange={(event) => handleQuantityChange(event, item.cartKey)}
          />
        </td>
        <td className="h-12 p-3">
          {'string' !== typeof item.totalPrice
            ? item.totalPrice.toFixed(2)
            : item.totalPrice}
        </td>
      </tr>
    </>
  );
};

export default MobileCartItem;
