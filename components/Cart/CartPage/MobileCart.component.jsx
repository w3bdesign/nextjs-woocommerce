import { v4 } from 'uuid';

import MobileCartItem from './MobileCartItem.component';
import SVGX from 'components/SVG/SVGX.component';

const MobileCart = ({ cart, handleRemoveProductClick, updateCart }) => {
  return (
    <section className="bg-white md:hidden lg:hidden xl:hidden">
      <div className="flex items-center justify-center">
        <div className="container">
          <table className="flex flex-row flex-no-wrap mx-auto my-5 overflow-hidden rounded-lg sm:bg-white sm:shadow-lg">
            <thead className="text-black">
              {cart.products.length &&
                cart.products.map(() => (
                  <tr
                    key={v4()}
                    className="flex flex-col mb-2 bg-white rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0"
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
              {/*
            {cart.products.length &&
                cart.products.map((item) => (

            <MobileCartItem
              key={item.productId}
              item={item}
              products={cart.products}
              handleRemoveProductClick={handleRemoveProductClick}
              updateCart={updateCart}
            />
            ))}

              */}

              {cart.products.length &&
                cart.products.map((item) => (
                  <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
                    <td className="h-12 p-3 border-2 border-gray-400 ">
                      <SVGX />
                    </td>
                    <td className="h-12 p-3 border-l-2 border-r-2 border-gray-400 ">
                      {item.name}
                    </td>
                    <td className="h-12 p-3 border-2 border-gray-400 ">
                      kr{item.price.toFixed(2)}
                    </td>
                    <td className="h-12 p-3 border-l-2 border-r-2 border-gray-400 ">
                      {item.qty}
                    </td>
                    <td className="h-12 p-3 border-2 border-gray-400 ">
                      {item.totalPrice}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*
     <MobileCartItem
              key={item.productId}
              item={item}
              products={cart.products}
              handleRemoveProductClick={handleRemoveProductClick}
              updateCart={updateCart}
            />
            */}
    </section>
  );
};

export default MobileCart;
