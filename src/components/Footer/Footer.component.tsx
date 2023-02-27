/**
 * Renders Footer of the application.
 * @function Layout
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => (
  <footer className="w-full md:w-11/12 sm:mt-20 mt-2 sm:bottom-0 px-6 mb-28 sm:mb-2 mx-auto text-center bg-white border border-gray-300 rounded-lg shadow">
    <div className="p-6">
      Copyright &copy; {new Date().getFullYear()} Daniel / w3bdesign
    </div>
  </footer>
);

export default Footer;
