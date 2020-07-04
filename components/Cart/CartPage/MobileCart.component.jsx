import MobileCartItem from './MobileCartItem.component';

const MobileCart = ({ cart, handleRemoveProductClick }) => {
  return (
    <section
      //className="container mx-auto bg-white md:hidden lg:hidden xl:hidden"
      className="bg-white md:hidden lg:hidden xl:hidden"
    >
      <div className="flex items-center justify-center">
        <div className="container">
          <table
            className="flex flex-row flex-no-wrap my-5 overflow-hidden rounded-lg sm:bg-white sm:shadow-lg"
            style={{ width: '365px' }}
          >
            <thead className="text-black">
              <tr className="flex flex-col mb-2 bg-gray-200 rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0">
                <th className="p-3 text-left">Fjern</th>
                <th className="p-3 text-left">Navn</th>
                <th className="p-3 text-left">Pris</th>
                <th className="p-3 text-left">Antall</th>
                <th className="p-3 text-left">Totalpris</th>
              </tr>
              <tr className="flex flex-col mb-2 bg-gray-200 rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0">
                <th className="p-3 text-left">Fjern</th>
                <th className="p-3 text-left">Navn</th>
                <th className="p-3 text-left">Pris</th>
                <th className="p-3 text-left">Antall</th>
                <th className="p-3 text-left">Totalpris</th>
              </tr>
              <tr className="flex flex-col mb-2 bg-gray-200 rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0">
                <th className="p-3 text-left">Fjern</th>
                <th className="p-3 text-left">Navn</th>
                <th className="p-3 text-left">Pris</th>
                <th className="p-3 text-left">Antall</th>
                <th className="p-3 text-left">Totalpris</th>
              </tr>
              <tr className="flex flex-col mb-2 bg-gray-200 rounded-l-lg flex-no wrap sm:table-row sm:rounded-none sm:mb-0">
                <th className="p-3 text-left">Fjern</th>
                <th className="p-3 text-left">Navn</th>
                <th className="p-3 text-left">Pris</th>
                <th className="p-3 text-left">Antall</th>
                <th className="p-3 text-left">Totalpris</th>
              </tr>
            </thead>
            <tbody className="flex-1 sm:flex-none">
              <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  X
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  WordPress Pennant
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  1
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
              </tr>
              <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  X
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  WordPress Pennant
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  1
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
              </tr>
              <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  X
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  WordPress Pennant
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  1
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
              </tr>
              <tr className="flex flex-col mb-2 flex-no wrap sm:table-row sm:mb-0">
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  X
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  WordPress Pennant
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  1
                </td>
                <td className="h-12 p-3 border border-grey-light hover:bg-gray-100">
                  kr 18.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col justify-between">
        {cart.products.length &&
          cart.products.map((item) => (
            <MobileCartItem
              key={item.productId}
              item={item}
              products={cart.products}
              handleRemoveProductClick={handleRemoveProductClick}
            />
          ))}
      </div>
    </section>
  );
};

export default MobileCart;
