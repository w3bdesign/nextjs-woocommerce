// Imports
import { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';

// State
import { CartContext } from '@/utils/context/CartProvider';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
//import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const CartContents = () => {
  const [cart, setCart] = useContext(CartContext);

  return (
    <>
      <section className="py-8  mt-10">
        <div className="container flex flex-wrap items-center mx-auto">
        
          {cart ? (
            cart.products.map((item: any) => (
              <div
                className="container mx-auto mt-4 flex flex-wrap flex-row justify-around items-center content-center m-w-[1380px] border border-gray-300 rounded-lg shadow
                 "
                key={item.cartKey}
              >
                <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                  <span className="block mt-2 font-extrabold">
                    Remove: <br />
                  </span>
                  <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                    REMOVE
                  </span>
                </div>

                <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                  <span className="block mt-2 font-extrabold">
                    Name: <br />
                  </span>
                  <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                    {item.name}
                  </span>
                </div>

                <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                  <span className="block mt-2 font-extrabold">
                    Quantity: <br />
                  </span>
                  <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                    {item.qty}
                  </span>
                </div>

                <div className="lg:m-2 xl:m-4 xl:w-1/6 lg:w-1/6 sm:m-2 w-auto">
                  <span className="block mt-2 font-extrabold">
                    Subtotal: <br />
                  </span>
                  <span className="inline-block mt-4 w-20 h-12 md:w-full lg:w-full xl:w-full">
                    {item.totalPrice}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <h1>Empty cart</h1>
          )}
        </div>
      </section>
    </>
  );
};

export default CartContents;
