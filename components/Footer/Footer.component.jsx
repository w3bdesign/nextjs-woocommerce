/**
 * Footer of the application.
 */
const Footer = () => {
  return (
    <>
      <footer className="container px-6 mx-auto text-center bg-white border border-gray-300 rounded-lg shadow">
        <div className="p-6">Copyright &copy; {new Date().getFullYear()} Daniel</div>
      </footer>
    </>
  );
};

export default Footer;
