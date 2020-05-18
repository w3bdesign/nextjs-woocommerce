function SingleProduct(props) {

  const {
    description,
    image,
    name,
    onSale,
    productId,
    price,
    regularPrice,
    salePrice
  } = props.product.products.edges[0].node;

  // Strip out HTML from description
  const DESCRIPTION_WITHOUT_HTML = description.replace(/(<([^>]+)>)/gi, '');

  return (
    <section className="py-8 bg-white">
      <div className="container flex flex-wrap items-center pt-4 pb-12 mx-auto ">
        <div className="grid grid-cols-2 gap-4 mt-16">
          <img
            id="product-image"
            className="h-auto transition duration-500 ease-in-out transform hover:grow hover:shadow-lg hover:scale-105"
            src={image.sourceUrl}
          />
          <div className="ml-8">
            <p className="text-3xl font-bold text-left">{name}</p>
            <br />
            {/* Display sale price when on sale */}
            {onSale && (
              <>
                <div className="flex">
                  <p className="pt-1 mt-4 text-3xl text-gray-900">{salePrice}</p>
                  <p className="pt-1 pl-8 mt-4 text-2xl text-gray-900 line-through">
                    {regularPrice}
                  </p>
                </div>
              </>
            )}
            {/* Display regular price when not on sale */}
            {!onSale && <p className="pt-1 mt-4 text-gray-900"> {price}</p>}
            <br />
            <p className="pt-1 mt-4 text-2xl text-gray-900">
              {DESCRIPTION_WITHOUT_HTML}
            </p>
            <p className="pt-1 mt-4 text-xl text-gray-900">
              <span className="py-2">Farge</span>
              <select
                id="farge"
                className="block w-64 px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
              >
                <option value="sort">Blå</option>
              </select>
            </p>

            <p className="pt-1 mt-2 text-xl text-gray-900 ">
              <span className="py-2">Størrelse</span>
              <select
                id="størrelse"
                className="block w-64 px-6 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
              >
                <option value="sort">Large</option>
              </select>
            </p>
            <p className="pt-1 mt-2">
              <button
                className="px-4 py-2 mt-4 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400"
                onClick={() => {
                  alert('Du har klikket kjøp');
                }}
              >
                KJØP
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SingleProduct;
