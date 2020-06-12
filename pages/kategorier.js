import Categories from 'components/Category/Categories.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';
import client from 'utils/apollo/ApolloClient.js';

import { FETCH_ALL_CATEGORIES_QUERY } from 'utils/const/GQL_QUERIES';

/**
 * Category page displays all of the categories
 */
const CategoryPage = ({ categories }) => {
  const error = false;

  return (
    <>
      {categories && <Categories categories={categories} />}

      {!categories && !error && (
        <div className="h-64 mt-8 text-2xl text-center">
          Laster ...
          <br />
          <LoadingSpinner />
        </div>
      )}

      {/* Display error message if error occured */}
      {error && (
        <div className="h-12 mt-20 text-2xl text-center">
          Feil under lasting av kategorier ...
        </div>
      )}
    </>
  );
};

export default CategoryPage;

export async function getStaticProps() {
  const result = await client.query({
    query: FETCH_ALL_CATEGORIES_QUERY,
  });

  return {
    props: {
      categories: result.data.productCategories.nodes,
    },
  };
}
