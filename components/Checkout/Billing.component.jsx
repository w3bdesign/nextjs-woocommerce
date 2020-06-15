import Error from './Error.component';

const countryList = [{ countryCode: 'NO', countryName: 'Norge' }];

const Billing = ({ input, handleOnChange }) => {
  return (
    <>
      <div className="row">
        <div className="p-0 pr-2 col-lg-6 col-md-12">
          <div className="form-group">
            <label htmlFor="first-name">
              Fornavn
              <abbr className="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.firstName}
              type="text"
              name="firstName"
              className="form-control woo-next-checkout-input"
              id="first-name"
            />
            <Error errors={input.errors} fieldName={'firstName'} />
          </div>
        </div>
        <div className="p-0 col-lg-6 col-sm-12">
          <div className="form-group">
            <label htmlFor="last-name">
              Etternavn
              <abbr className="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.lastName}
              type="text"
              name="lastName"
              className="form-control woo-next-checkout-input"
              id="last-name"
            />
            <Error errors={input.errors} fieldName={'lastName'} />
          </div>
        </div>
      </div>
      {/* Company Name */}
      <div className="form-group">
        <label htmlFor="first-name">Firma</label>
        <input
          onChange={handleOnChange}
          value={input.company}
          type="text"
          name="company"
          className="form-control woo-next-checkout-input"
          id="first-name"
        />
        <Error errors={input.errors} fieldName={'company'} />
      </div>
      {/* Country */}
      <div className="form-group">
        <label htmlFor="country-select">
          Land
          <abbr className="required" title="required">
            *
          </abbr>
        </label>
        <select
          onChange={handleOnChange}
          value={input.country}
          name="country"
          className="form-control woo-next-checkout-input"
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
      <div className="form-group">
        <label htmlFor="street-address">
          Addresse
          <abbr className="required" title="required">
            *
          </abbr>
        </label>
        <input
          type="text"
          onChange={handleOnChange}
          value={input.address1}
          name="address1"
          placeholder="Gateaddresse"
          className="form-control woo-next-checkout-input"
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
          className="form-control woo-next-checkout-input"
          id="first-name"
        />
      </div>
      {/* Town/City */}
      <div className="form-group">
        <label htmlFor="city">
          By
          <abbr className="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.city}
          type="text"
          name="city"
          className="form-control woo-next-checkout-input"
          id="city"
        />
        <Error errors={input.errors} fieldName={'city'} />
      </div>
      {/* County */}
      <div className="form-group">
        <label htmlFor="state">
          Fylke
          <abbr className="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.state}
          type="text"
          name="state"
          className="form-control woo-next-checkout-input"
          id="state"
        />
        <Error errors={input.errors} fieldName={'state'} />
      </div>
      {/* Post Code */}
      <div className="form-group">
        <label htmlFor="post-code">
          Postnummer
          <abbr className="required" title="required">
            *
          </abbr>
        </label>
        <input
          onChange={handleOnChange}
          value={input.postcode}
          type="text"
          name="postcode"
          className="form-control woo-next-checkout-input"
          id="post-code"
        />
        <Error errors={input.errors} fieldName={'postcode'} />
      </div>
      {/*Phone & Email*/}
      <div className="row">
        <div className="p-0 pr-2 col-lg-6 col-md-12">
          <div className="form-group">
            <label htmlFor="phone">
              Telefon
              <abbr className="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.phone}
              type="text"
              name="phone"
              className="form-control woo-next-checkout-input"
              id="phone"
            />
            <Error errors={input.errors} fieldName={'phone'} />
          </div>
        </div>
        <div className="p-0 col-lg-6 col-sm-12">
          <div className="form-group">
            <label htmlFor="email">
              Epost
              <abbr className="required" title="required">
                *
              </abbr>
            </label>
            <input
              onChange={handleOnChange}
              value={input.email}
              type="email"
              name="email"
              className="form-control woo-next-checkout-input"
              id="email"
            />
            <Error errors={input.errors} fieldName={'email'} />
          </div>
        </div>
      </div>

      <br />

      { // https://tailwindcss.com/components/forms/# 
      }

      

      
    </>
  );
};

export default Billing;
