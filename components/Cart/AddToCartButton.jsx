import { Link } from 'next/link';

function AddToCartButton(props) {
    console.log("Add to cart");
    console.log(props);
  return (
    <>
      <button className="px-4 py-2 font-bold bg-white border border-gray-400 border-solid rounded hover:bg-gray-400">
        KJØP
      </button>
    </>
  );
}

export default AddToCartButton;
