import Header from 'components/Header/Header.component';
import Hero from 'components/Main/Hero.component';
import IndexProducts from 'components/Main/IndexProducts.component';

function HomePage(props) {
  console.log(process.env.VERCEL_URL)
  // We can destructure here or inside the map.
  // We should probably destructure in the function declaration.  
  return (
    <>
      <Header />
      <Hero />
      <IndexProducts products={props} />
    </>
  );
}

// Prerender data for quicker loading.
// Should we use getServerSideProps?

export async function getStaticProps() {
  console.log(process.env.VERCEL_URL)
  const products = await fetch(`${process.env.VERCEL_URL}/api/getWooProducts`)
    .then((res) => res.json())
    .catch((error) => console.log(error));

  return {
    props: {
      products,
    },
  };
}

export default HomePage;
