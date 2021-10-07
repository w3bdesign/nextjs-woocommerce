import Categories from 'components/Category/Categories.component';
import PageTemplate from 'components/PageTemplate/PageTemplate.component';

import client from 'utils/apollo/ApolloClient.js';

import { FETCH_ALL_CATEGORIES_QUERY } from 'utils/gql/GQL_QUERIES';

/**
 * Category page displays all of the categories
 */
const CategoryPage = ({ categories }) => {
  return (
    <>
      <PageTemplate title="Kategorier" input={categories}>
        {categories && <Categories categories={categories} />}
      </PageTemplate>
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
    revalidate: 10,
  };
}
