


function ProduktPage(props) {

  return (
    <>
      <div>Se console.log</div>
    </>
  );
}

/*export async function getStaticProps() {
    const products = await fetch(`${process.env.NEXTJS_URL}/api/getSingleWooProduct`)
      .then((res) => res.json())
      .catch((error) => console.log(error));
  
    return {
      props: {
        products,
      },
    };
  }*/

export default ProduktPage;
