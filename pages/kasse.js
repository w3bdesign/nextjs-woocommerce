import Header from 'components/Header/Header.component';
import CheckoutForm from 'components/Checkout/CheckoutForm.component';
import PageTitle from 'components/Title/PageTitle.component';

const Kasse = () => (
  <>
    <Header title="- Gå til kasse" />
    <PageTitle title="Din ordre" />
    <CheckoutForm />
  </>
);
export default Kasse;
