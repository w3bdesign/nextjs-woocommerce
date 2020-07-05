import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

/**
 * Map over the categories and display them individually.
 * Uses uuidv4 for unique key IDs
 * @param {Object} categories
 */
const Categories = ({ categories }) => {
  return (
    <>
      <section className="container mx-auto bg-white">
      <div className="grid gap-2 px-2 pt-2 pb-2 lg:px-0 xl:px-0 md:px-0 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 xs:grid-cols-3">
          {categories.map(({ id, name, slug }) => (
            <Link
              key={uuidv4()}
              as={`/kategori/${slug}?id=${id}`}
              href="/kategori/[id]"
            >
              <div
                //className="flex flex-col justify-around p-6 cursor-pointer xs:w-1/2 md:w-1/3 xl:w-1/4"
                className="p-6 cursor-pointer"
              >
                <div className="flex items-center justify-center w-full h-16 text-center border border-gray-300 rounded-lg shadow hover:shadow-outline">
                  <p className="text-lg">{name}</p>
                </div>
              </div>
            </Link>
          ))}
       </div>
      </section>
    </>
  );
};

export default Categories;
