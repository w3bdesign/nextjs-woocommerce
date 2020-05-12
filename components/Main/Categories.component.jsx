function Categories(props) {
  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
        <nav id="store" className="top-0 z-30 w-full px-6 py-1">
          <div className="container w-full px-2 py-3 mx-auto mt-0 mt-16 text-center">
            <a
              className="text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline "
              href="#"
            >
              Kategorier
            </a>
          </div>
        </nav>

        {props.categories.posts.map(({ id, name }) => (
          <div key={id} className="flex flex-col w-full p-6 md:w-1/3 xl:w-1/4">
            <div className="flex items-center justify-between pt-3">
              <p className="">{name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
