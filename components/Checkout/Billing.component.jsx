import Error from './Error.component';
import CheckoutTitle from 'components/Header/CheckoutTitle.component';



const Billing = ({ input, handleOnChange }) => {
  return (
    <>
      {
        // https://tailwindcss.com/components/forms/#
        // https://react-hook-form.com/get-started#Quickstart
      }

      <section className="relative text-gray-700 body-font">
        <div className="container px-5 py-2 mx-auto">
          
            <CheckoutTitle title="Betalingsdetaljer" />           
         
          <div className="mx-auto lg:w-1/2 md:w-2/3">
            <div className="flex flex-wrap -m-2">
              <div className="w-1/2 p-2">
                <label className="pb-4">Fornavn</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Fornavn"
                  type="text"
                  onChange={handleOnChange}
                  value={input.firstName}
                  name="firstName"
                  id="first-name"
                />
                <Error errors={input.errors} fieldName={'firstName'} />
              </div>
              <div className="w-1/2 p-2">
                <label className="pb-4">Etternavn</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Etternavn"
                  type="text"
                  onChange={handleOnChange}
                  value={input.lastName}
                  name="lastName"
                  id="last-name"
                />
                <Error errors={input.errors} fieldName={'lastName'} />
              </div>

              <div className="w-1/2 p-2">
                <label className="pb-4">Adresse</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Addresse"
                  type="text"
                  onChange={handleOnChange}
                  value={input.address1}
                  name="address1"
                  id="address1"
                />
                <Error errors={input.errors} fieldName={'address1'} />
              </div>

              <div className="w-1/2 p-2">
                <label className="pb-4">Postnummer</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Postnummer"
                  type="text"
                  onChange={handleOnChange}
                  value={input.postcode}
                  name="postcode"
                  id="post-code"
                />
                <Error errors={input.errors} fieldName={'postcode'} />
              </div>

              <div className="w-1/2 p-2">
                <label className="pb-4">Sted</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Sted"
                  type="text"
                  onChange={handleOnChange}
                  value={input.city}
                  name="city"
                  id="city"
                />
                <Error errors={input.errors} fieldName={'city'} />
              </div>

              <div className="w-1/2 p-2">
                <label className="pb-4">Epost</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Epost"
                  type="text"
                  onChange={handleOnChange}
                  value={input.email}
                  name="email"
                  id="email"
                />
                <Error errors={input.errors} fieldName={'email'} />
              </div>

              <div className="w-1/2 p-2">
                <label className="pb-4">Telefon</label>
                <input
                  className="w-full px-4 py-2 mt-2 text-base bg-white border border-gray-400 rounded focus:outline-none focus:border-black"
                  placeholder="Telefon"
                  type="text"
                  onChange={handleOnChange}
                  value={input.phone}
                  name="phone"
                  id="phone1"
                />
                <Error errors={input.errors} fieldName={'phone'} />
              </div>

              <div className="w-1/2 p-2">
                <input
                  className="hidden"
                  value="bacs"
                  name="paymentMethod"
                  type="radio"
                  checked
                />
              </div>

              <div className="w-full p-2">
                <button className="flex px-4 py-2 mx-auto font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
                  BESTILL
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Billing;
