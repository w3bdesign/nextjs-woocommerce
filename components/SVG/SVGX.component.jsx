/**
 * The SVG that we display inside of the cart to remove items
 */

const SVGX = ({ cartKey, products, handleRemoveProductClick }) => {
  //console.log("Props: ");
  //console.log(props);
  return (
    <>
      <svg
        id="xsvg"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cursor-pointer feather feather-x"
        onClick={(event) => {
          handleRemoveProductClick( event, cartKey, products )
        }}
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </>
  );
};

export default SVGX;
