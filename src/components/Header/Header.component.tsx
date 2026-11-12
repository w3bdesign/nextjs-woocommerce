import Navbar from '@/components/Header/Navbar.component';

/**
 * Renders the header for each page.
 * Page <title> and meta tags are set through the App Router Metadata API
 * (`metadata` / `generateMetadata` in `src/app`).
 * @function Header
 * @returns {JSX.Element} - Rendered component
 */
const Header = () => (
  <div className="container mx-auto px-6">
    <Navbar />
  </div>
);

export default Header;
