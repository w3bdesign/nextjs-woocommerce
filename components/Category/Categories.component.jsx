import { v4 as uuidv4 } from 'uuid';

import PageTitle from 'components/Header/PageTitle.component';

/**
 * Map over the categories and display them individually.
 * Uses uuidv4 for unique key IDs
 * @param {Object} categories
 */
const Categories = ({ categories }) => {
  return (
    <>
      <PageTitle title="Kategorier" />

      <section className="py-8 bg-white">
        <div className="container flex flex-wrap items-center mx-auto">
          {categories.map(({ name }) => (
            <div
              key={uuidv4()}
              className="flex flex-col w-full p-6 md:w-1/3 xl:w-1/4"
            >
              <div className="flex items-center justify-center p-6 text-center border border-gray-300 rounded-lg shadow hover:shadow-outline">
                <p className="text-lg">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Categories;
