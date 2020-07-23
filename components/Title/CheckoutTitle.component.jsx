const CheckoutTitle = ({ title }) => {
  return (
    <>
      <section className="container py-4 pl-8 mx-auto text-center bg-white">
        <span className="py-2 text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline">
          {title}
        </span>
      </section>
    </>
  );
};

export default CheckoutTitle;
