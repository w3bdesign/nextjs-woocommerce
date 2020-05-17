import { v4 as uuidv4 } from 'uuid';

function Categories(props) {
  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto">
        <nav id="store" className="top-0 w-full px-6 py-1">
          <div className="container w-full px-2 py-3 mx-auto mt-0 mt-16 text-center">
            <a
              className="text-xl font-bold tracking-wide text-gray-800 no-underline uppercase hover:no-underline "
              href="#"
            >
              Kategorier
            </a>
          </div>
        </nav>

        {props.categories.productCategories.nodes.map(({  name }) => (
          <div key={uuidv4()} className="flex flex-col w-full p-6 md:w-1/3 xl:w-1/4">
            <div className="flex items-center justify-center p-6 text-center rounded shadow">
              <p className="text-lg">{name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
