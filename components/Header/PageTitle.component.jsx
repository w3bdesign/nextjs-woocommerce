const PageTitle = ({ title, marginleft }) => {
  return (
    <>
      {marginleft ? (
        <section className="container pl-6 mx-auto mt-24 bg-white">
          <span className="py-2 text-xl font-bold tracking-wide text-left text-gray-800 no-underline uppercase hover:no-underline">
            {title}
          </span>
        </section>
      ) : (
        <section className="container pl-4 mx-auto mt-24 bg-white">
          <span className="py-2 text-xl font-bold tracking-wide text-left text-gray-800 no-underline uppercase hover:no-underline">
            {title}
          </span>
        </section>
      )}
    </>
  );
};

export default PageTitle;
