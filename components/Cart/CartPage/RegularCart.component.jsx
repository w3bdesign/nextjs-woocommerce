import CartItem from './CartItem.component';

const RegularCart = ({ cart, handleRemoveProductClick, updateCart, updateCartProcessing }) => {
  return (
    <table className="hidden table-auto md:block lg:block xl:block">
      <thead>
        <tr>
          <th className="px-4 py-2" scope="col" />
          <th className="px-4 py-2" scope="col" />
          <th className="px-4 py-2" scope="col">
            Produkt
          </th>
          <th className="px-4 py-2" scope="col">
            Pris
          </th>
          <th className="px-4 py-2" scope="col">
            Antall
          </th>
          <th className="px-4 py-2" scope="col">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {cart.products.length &&
          cart.products.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              products={cart.products}
              handleRemoveProductClick={handleRemoveProductClick}              
              updateCart={updateCart}
              updateCartProcessing={updateCartProcessing}
            />
          ))}
      </tbody>
    </table>
  );
};

export default RegularCart;
