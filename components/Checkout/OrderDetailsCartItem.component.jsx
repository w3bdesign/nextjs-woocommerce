import { useState } from 'react';

const OrderDetailsCartItem = ({ item }) => {
  const [productCount, setProductCount] = useState(item.qty);

  return (
    <tr className="bg-gray-100">
      <td className="px-0 py-2 border sm:px-4 md:px-4 lg:px-4 xl:px-4">
        <img
          className="hidden sm:block md:block lg:block xl:block"
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

      <td className="px-4 py-2 border">{productCount}</td>

      <td className="px-4 py-2 border">
        {'string' !== typeof item.totalPrice
          ? item.totalPrice.toFixed(2)
          : item.totalPrice}
      </td>
    </tr>
  );
};

export default OrderDetailsCartItem;
