/**
 * The SVG that we use for search in the navbar for mobile.
 * Also includes logic for closing and opening the search form.
 */

// Pure function moved to module scope to avoid rebuilding on every render
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const SVGMobileSearchIcon = () => {
  return (
    <div className="inline mb-0.5 mr-2 md:hidden xl:hidden">
      <button
        type="button"
        className="cursor-pointer bg-transparent border-none p-0"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg
          fill="#fff"
          xmlns="https://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="35px"
          height="35px"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M21 3C11.6 3 4 10.6 4 20C4 29.4 11.6 37 21 37C24.4 37 27.5 36 30.1 34.3L42.4 46.6L46.6 42.4L34.5 30.3C36.7 27.4 38 23.9 38 20C38 10.6 30.4 3 21 3ZM21 7C28.2 7 34 12.8 34 20C34 27.2 28.2 33 21 33C13.8 33 8 27.2 8 20C8 12.8 13.8 7 21 7Z" />
        </svg>
      </button>
    </div>
  );
};

export default SVGMobileSearchIcon;
