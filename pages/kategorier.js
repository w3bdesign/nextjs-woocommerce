import Header from 'components/Header/Header.component';
import Categories from 'components/Main/Categories.component';

function CategoryPage(props) {  
  return (
    <>
      <Header />
      <Categories categories={props} />
    </>
  );
}

// Prerender data for quicker loading.
// Should we use getServerSideProps?

export async function getStaticProps() {
  //const posts = await fetch(`${process.env.NEXTJS_URL}/api/getWooCategories`)
  const posts = await fetch("http://nextjs-woocommerce-a49viog5j.now.sh/api/getWooCategories")
  
    .then((res) => res.json())
    .catch((error) => console.log(error));

  return {
    props: {
      posts,
    },
  };
}

export default CategoryPage;
