// https://github.com/algolia/react-instantsearch
function MobileSearch() {
  return (
    <>
      <div className="inline mt-6">
        <form>
          <input
            className="px-6 py-2 mt-4 bg-white border border-gray-500 rounded-lg focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Søk ..."
          />
          <div id="mobile-search" className="absolute -mt-8">
            <a
              className="inline-block pl-3 no-underline hover:text-black"
              onClick={() => {
                alert('Du har klikket søkeknappen');
              }}
              href="#"
            >
              <svg

                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z" />
              </svg>
            </a>
          </div>
        </form>
      </div>
    </>
  );
}

export default MobileSearch;
