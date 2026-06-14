/**
 * Loading spinner, shows while loading products or categories.
 */
const LoadingSpinner = () => (
  <div className="w-full h-full flex justify-center items-center p-4 mt-2">
    <output>
      <svg
        aria-hidden="true"
        className="inline size-16 text-surface-alt animate-spin fill-primary"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.6C100 78.2 77.6 100.6 50 100.6C22.4 100.6 0 78.2 0 50.6C0 23 22.4.6 50 .6C77.6.6 100 23 100 50.6ZM9.1 50.6C9.1 73.2 27.4 91.5 50 91.5C72.6 91.5 90.9 73.2 90.9 50.6C90.9 28 72.6 9.7 50 9.7C27.4 9.7 9.1 28 9.1 50.6Z"
          fill="currentColor"
        />
        <path
          d="M94 39C96.4 38.4 97.9 35.9 97 33.6C95.3 28.8 92.9 24.4 89.8 20.3C85.8 15.1 80.9 10.7 75.2 7.4C69.5 4.1 63.3 1.9 56.8 1.1C51.8.4 46.7.4 41.7 1.3C39.3 1.7 37.8 4.2 38.5 6.6C39.1 9 41.6 10.5 44.1 10.1C47.9 9.5 51.7 9.5 55.5 10C60.9 10.8 66 12.5 70.6 15.3C75.3 18 79.3 21.6 82.6 25.8C84.9 28.9 86.8 32.3 88.2 35.9C89.1 38.2 91.5 39.7 94 39Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Laster ...</span>
    </output>
  </div>
);

export default LoadingSpinner;
