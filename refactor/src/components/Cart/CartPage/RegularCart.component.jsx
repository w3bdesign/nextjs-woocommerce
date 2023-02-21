import React from 'react';

import CartItem from './CartItem.component';

const RegularCart = ({
  cart,
  handleRemoveProductClick,
  updateCart,
  updateCartProcessing,
}) => (
  <table className="">
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
          <React.Fragment key={item.cartKey}>
            <CartItem
              item={item}
              products={cart.products}
              handleRemoveProductClick={handleRemoveProductClick}
              updateCart={updateCart}
              updateCartProcessing={updateCartProcessing}
            />
          </React.Fragment>
        ))}
    </tbody>
  </table>
);

export default RegularCart;
