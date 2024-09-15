/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => (
  <footer className="bg-white mb-4 hidden md:block px-4">
    <div className="container flex md:flex-wrap flex-col md:flex-row items-center justify-between px-6 py-3 mx-auto mt-0 md:min-w-96 border border-gray-200 rounded">
      <div className="text-gray-600 mx-auto">
        &copy; {new Date().getFullYear()} Daniel / w3bdesign
      </div>
    </div>
  </footer>
);

export default Footer;
