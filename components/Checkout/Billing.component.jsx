import Error from './Error.component';

const countryList = [{ countryCode: 'NO', countryName: 'Norge' }];

const Billing = ({ input, handleOnChange }) => {
  return (
    <>
      <div classNameName="row">
        <div classNameName="p-0 pr-2 col-lg-6 col-md-12">
          <div classNameName="form-group">
            <label htmlFor="first-name">
              Fornavn
              <abbr classNameName="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.firstName}
              type="text"
              name="firstName"
              classNameName="form-control woo-next-checkout-input"
              id="first-name"
            />
            <Error errors={input.errors} fieldName={'firstName'} />
          </div>
        </div>
        <div classNameName="p-0 col-lg-6 col-sm-12">
          <div classNameName="form-group">
            <label htmlFor="last-name">
              Etternavn
              <abbr classNameName="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.lastName}
              type="text"
              name="lastName"
              classNameName="form-control woo-next-checkout-input"
              id="last-name"
            />
            <Error errors={input.errors} fieldName={'lastName'} />
          </div>
        </div>
      </div>
      {/* Company Name */}
      <div classNameName="form-group">
        <label htmlFor="first-name">Firma</label>
        <input
          onChange={handleOnChange}
          value={input.company}
          type="text"
          name="company"
          classNameName="form-control woo-next-checkout-input"
          id="first-name"
        />
        <Error errors={input.errors} fieldName={'company'} />
      </div>
      {/* Country */}
      <div classNameName="form-group">
        <label htmlFor="country-select">
          Land
          <abbr classNameName="required" title="required">
            *
          </abbr>
        </label>
        <select
          onChange={handleOnChange}
          value={input.country}
          name="country"
          classNameName="form-control woo-next-checkout-input"
          id="country-select"
        >
          <option value="">Velg ditt land ...</option>
          {countryList.length &&
            countryList.map((country, index) => (
              <option key={`${country}-${index}`} value={country.countryCode}>
                {country.countryName}
              </option>
            ))}
        </select>
        <Error errors={input.errors} fieldName={'country'} />
      </div>
      {/* Street Address */}
      <div classNameName="form-group">
        <label htmlFor="street-address">
          Addresse
          <abbr classNameName="required" title="required">
            *
          </abbr>
        </label>
        <input
          type="text"
          onChange={handleOnChange}
          value={input.address1}
          name="address1"
          placeholder="Gateaddresse"
          classNameName="form-control woo-next-checkout-input"
          id="street-address"
        />
        <Error errors={input.errors} fieldName={'address1'} />
        <br />
        <input
          type="text"
          onChange={handleOnChange}
          value={input.address2}
          name="address2"
          placeholder="Apartment, suite, unit etc.(optional)"
          classNameName="form-control woo-next-checkout-input"
          id="first-name"
        />
      </div>
      {/* Town/City */}
      <div classNameName="form-group">
        <label htmlFor="city">
          By
          <abbr classNameName="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.city}
          type="text"
          name="city"
          classNameName="form-control woo-next-checkout-input"
          id="city"
        />
        <Error errors={input.errors} fieldName={'city'} />
      </div>
      {/* County */}
      <div classNameName="form-group">
        <label htmlFor="state">
          Fylke
          <abbr classNameName="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.state}
          type="text"
          name="state"
          classNameName="form-control woo-next-checkout-input"
          id="state"
        />
        <Error errors={input.errors} fieldName={'state'} />
      </div>
      {/* Post Code */}
      <div classNameName="form-group">
        <label htmlFor="post-code">
          Postnummer
          <abbr classNameName="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.postcode}
          type="text"
          name="postcode"
          classNameName="form-control woo-next-checkout-input"
          id="post-code"
        />
        <Error errors={input.errors} fieldName={'postcode'} />
      </div>
      {/*Phone & Email*/}
      <div classNameName="row">
        <div classNameName="p-0 pr-2 col-lg-6 col-md-12">
          <div classNameName="form-group">
            <label htmlFor="phone">
             Telefon
              <abbr classNameName="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.phone}
              type="text"
              name="phone"
              classNameName="form-control woo-next-checkout-input"
              id="phone"
            />
            <Error errors={input.errors} fieldName={'phone'} />
          </div>
        </div>
        <div classNameName="p-0 col-lg-6 col-sm-12">
          <div classNameName="form-group">
            <label htmlFor="email">
              Epost
              <abbr classNameName="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.email}
              type="email"
              name="email"
              classNameName="form-control woo-next-checkout-input"
              id="email"
            />
            <Error errors={input.errors} fieldName={'email'} />
          </div>
        </div>
      </div>
<br/>







      <div className="w-full max-w-lg">
  <div className="flex flex-wrap mb-6 -mx-3">
    <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-first-name">
        First Name
      </label>
      <input className="block w-full px-4 py-3 mb-3 leading-tight text-gray-700 bg-gray-200 border border-red-500 rounded appearance-none focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Jane" />
      <p className="text-xs italic text-red-500">Please fill out this field.</p>
    </div>
    <div className="w-full px-3 md:w-1/2">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-last-name">
        Last Name
      </label>
      <input className="block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="Doe" />
    </div>
  </div>
  <div className="flex flex-wrap mb-6 -mx-3">
    <div className="w-full px-3">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-password">
        Password
      </label>
      <input className="block w-full px-4 py-3 mb-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500" id="grid-password" type="password" placeholder="******************" />
      <p className="text-xs italic text-gray-600">Make it as long and as crazy as you'd like</p>
    </div>
  </div>
  <div className="flex flex-wrap mb-2 -mx-3">
    <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-city">
        City
      </label>
      <input className="block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="text" placeholder="Albuquerque" />
    </div>
    <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-state">
        State
      </label>
      <div className="relative">
        <select className="block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state">
          <option>New Mexico</option>
          <option>Missouri</option>
          <option>Texas</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
          <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
    <div className="w-full px-3 mb-6 md:w-1/3 md:mb-0">
      <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase" for="grid-zip">
        Zip
      </label>
      <input className="block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500" id="grid-zip" type="text" placeholder="90210" />
    </div>
  </div>
</div>







    </>
  );
};

export default Billing;
