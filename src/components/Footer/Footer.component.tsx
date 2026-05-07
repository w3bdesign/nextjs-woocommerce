/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => (
  <footer className="w-full bg-surface border-t border-border mt-12">
    <div className="container mx-auto px-6">
      <div className="py-4">
        <div className="text-text-muted text-center" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Daniel / w3bdesign
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
