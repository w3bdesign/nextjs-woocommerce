import CheckoutTitle from 'components/Header/CheckoutTitle.component';
import OrderDetailsCartItem from './OrderDetailsCartItem.component';

const OrderDetails = ({ cart }) => {
  return (
    <>
      <section className="py-8 bg-white">
        <div className="container flex flex-wrap items-center mx-auto">
          {cart ? (
            <div className="p-6 mx-auto mt-5">
              <CheckoutTitle title="Handlekurv" />

              <table className="table-auto">
                <thead>
                  <tr>                   
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
                      <OrderDetailsCartItem
                        key={item.productId}
                        item={item}
                        products={cart.products}
                        // updateCartProcessing={updateCartProcessing}
                        // handleRemoveProductClick={handleRemoveProductClick}
                        // updateCart={updateCart}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            ''
          )}
        </div>
      </section>
    </>
  );
};

export default OrderDetails;
