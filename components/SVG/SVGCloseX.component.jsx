/**
 * The SVG that we display to close the cart or the mobile search
 */
const SVGCloseX = ({ setisExpanded }) => {
  return (
    <>
      <svg
        width="80px"
        height="80px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 234.6 45.47"
        onClick={() => {
          setisExpanded(false);
        }}
      >
        <path
          d="M202.83,209.89H181v-42H186v37.56h16.87Z"
          transform="translate(-181.03 -167)"
        />
        <path
          d="M239.16,192.9q0,17.7-16,17.7-15.28,0-15.29-17v-25.7h4.92v25.37q0,12.93,10.9,12.92,10.51,0,10.52-12.48V167.88h4.92Z"
          transform="translate(-181.03 -167)"
        />
        <path
          d="M278.89,209.89H272L255.8,190.68a11.17,11.17,0,0,1-1.11-1.47h-.12v20.68h-4.92v-42h4.92v19.75h.12a11.26,11.26,0,0,1,1.11-1.44l15.7-18.31h6.13l-18,20.16Z"
          transform="translate(-181.03 -167)"
        />
        <path
          d="M313.69,209.89h-6.86L290.6,190.68a13.49,13.49,0,0,1-1.11-1.47h-.12v20.68h-4.92v-42h4.92v19.75h.12a12.26,12.26,0,0,1,1.11-1.44l15.71-18.31h6.12l-18,20.16Z"
          transform="translate(-181.03 -167)"
        />
        <line
          x1="232.6"
          y1="2"
          x2="188.6"
          y2="43.47"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <line
          x1="188.6"
          y1="2"
          x2="232.6"
          y2="43.47"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </svg>
    </>
  );
};

export default SVGCloseX;
