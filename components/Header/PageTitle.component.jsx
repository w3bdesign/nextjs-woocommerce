const PageTitle = ({ title }) => {
  return (
    <section className="py-4 bg-white">
      <div className="container flex flex-wrap items-center mx-auto">
        <div className="container py-2 mx-auto mt-16 text-center">
          <span className="text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline">
            {title}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
