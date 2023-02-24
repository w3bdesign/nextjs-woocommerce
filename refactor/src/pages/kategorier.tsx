import { NextPage, InferGetStaticPropsType, GetStaticProps } from 'next';

import Categories from '@/components/Category/Categories.component';
import Layout from '@/components/Layout/Layout.component';

import client from '@/utils/apollo/ApolloClient.js';

import { FETCH_ALL_CATEGORIES_QUERY } from '@/utils/gql/GQL_QUERIES';


/**
 * Category page displays all of the categories
 */
const Kategorier: NextPage = ({
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <Layout title="Kategorier">
    {categories && <Categories categories={categories} />}
  </Layout>
);

export default Kategorier;

export const getStaticProps: GetStaticProps = async () => {
  const result = await client.query({
    query: FETCH_ALL_CATEGORIES_QUERY,
  });

  return {
    props: {
      categories: result.data.productCategories.nodes,
    },
    revalidate: 10,
  };
};
