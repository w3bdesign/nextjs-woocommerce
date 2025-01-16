/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => (
  <footer className="w-full bg-white border-t border-gray-200 mt-12">
    <div className="container mx-auto px-6 px-1">
      <div className="py-4">
        <div className="text-gray-600 text-center">
          &copy; {new Date().getFullYear()} Daniel / w3bdesign
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
