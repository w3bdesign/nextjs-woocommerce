import React from 'react';

/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer: React.FC = () => (
  <footer className="bg-white py-4 mt-auto hidden md:block">
    <div className="container mx-auto px-6">
      <div className="text-gray-600 text-center">
        &copy; {new Date().getFullYear()} Daniel / w3bdesign
      </div>
    </div>
  </footer>
);

export default Footer;
