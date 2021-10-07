import Header from 'components/Header/Header.component';
import LoadingSpinner from 'components/LoadingSpinner/LoadingSpinner.component';
import PageTitle from 'components/Title/PageTitle.component';

/**
 *
 * Reusable template for pages
 *
 */

const PageTemplate = ({ input, title, children }) => {
  const error = false;

  return (
    <>
      <Header title={title} />
      <PageTitle title={title} />
      {children}
      {!input && !error && (
        <div className="h-64 mt-8 text-2xl text-center">
          Laster ...
          <LoadingSpinner />
        </div>
      )}
      {/* Display error message if error occured */}
      {error && (
        <div className="h-12 mt-20 text-2xl text-center">
          Feil under lasting av produkter ...
        </div>
      )}
    </>
  );
};

export default PageTemplate;
