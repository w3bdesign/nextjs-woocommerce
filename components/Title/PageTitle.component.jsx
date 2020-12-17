const PageTitle = ({ title, marginleft }) => {
  return (
    <>
      {marginleft ? (
        <section className="container pl-8 mx-auto mt-32 text-center bg-white">
          <span className="py-2 text-xl font-bold tracking-wide text-center text-gray-800 no-underline uppercase hover:no-underline">
            {title}
          </span>
        </section>
      ) : (
        <section className="container pl-4 mx-auto mt-32 text-center bg-white">
          <span className="py-2 text-xl font-bold tracking-wide text-center text-gray-800 no-underline uppercase hover:no-underline">
            {title}
          </span>
        </section>
      )}
    </>
  );
};

export default PageTitle;
