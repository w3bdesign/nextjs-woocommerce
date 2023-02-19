import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import MobileCartItem from './MobileCartItem.component';

const MobileCart = ({ cart, handleRemoveProductClick, updateCart }) => (
  <section className="bg-white md:hidden lg:hidden xl:hidden">
    <div className="flex items-center justify-center">
      <div className="container">
        <table className="flex flex-row flex-no-wrap mx-auto my-5 overflow-hidden ">
          <thead className="text-black">
            {cart.products.length &&
              cart.products.map(() => (
                <tr
                  key={uuidv4()}
                  className="flex flex-col mb-2 bg-white border border-gray-300 rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0"
                >
                  <th className="p-3 text-left">Fjern</th>
                  <th className="p-3 text-left">Navn</th>
                  <th className="p-3 text-left">Pris</th>
                  <th className="p-3 text-left">Antall</th>
                  <th className="p-3 text-left">Totalpris</th>
                </tr>
              ))}
          </thead>
          <tbody className="flex-1 sm:flex-none">
            {cart.products.length &&
              cart.products.map((item) => (
                <React.Fragment key={item.cartKey}>
                  <MobileCartItem
                    item={item}
                    products={cart.products}
                    handleRemoveProductClick={handleRemoveProductClick}
                    updateCart={updateCart}
                  />
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default MobileCart;
