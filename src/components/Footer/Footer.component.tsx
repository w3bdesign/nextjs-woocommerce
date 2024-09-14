import React from 'react';

/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
      <div className="text-gray-600">
        &copy; {new Date().getFullYear()} Daniel / w3bdesign
      </div>
    </div>
  </footer>
);

export default Footer;
