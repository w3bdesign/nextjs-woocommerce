import Header from 'components/Header/Header.component';
import Hero from 'components/Main/Hero.component';
import Products from 'components/Main/Products.component';

function HomePage(props) {
  // We can destructure here or inside the map.
  // We should probably destructure in the function declaration.  
  return (
    <>
      <Header />
      <Hero />
      <Products products={props} />
    </>
  );
}

// Prerender data for quicker loading.
// Should we use getServerSideProps?

export async function getStaticProps() {
  const posts = await fetch(`${process.env.NEXTJS_URL}/api/getWooProducts`)
    .then((res) => res.json())
    .catch((error) => console.log(error));

  return {
    props: {
      posts,
    },
  };
}

export default HomePage;
