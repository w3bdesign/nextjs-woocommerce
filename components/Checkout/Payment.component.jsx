const Payment = ({ input, handleOnChange }) => (
  <div className="mt-3">
    <label className="form-check-label">
      <input
        onChange={handleOnChange}
        value="bacs"
        className="form-check-input"
        name="paymentMethod"
        type="radio"
      />
      <span className="woo-next-payment-content">Direkte bankoverføring</span>
    </label>
  </div>
);

export default Payment;
