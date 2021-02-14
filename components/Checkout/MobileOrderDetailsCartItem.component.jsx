const MobileOrderDetailsCartItem = ({ item }) => (
  <>
    <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
      
      <td className="h-12 p-3">{item.name}</td>
      <td className="h-12 p-3">
        kr{'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
      </td>
      <td className="h-12 p-3">{item.qty}</td>
      <td className="h-12 p-3">
        {'string' !== typeof item.totalPrice
          ? item.totalPrice.toFixed(2)
          : item.totalPrice}
      </td>
    </tr>
  </>
);

export default MobileOrderDetailsCartItem;
