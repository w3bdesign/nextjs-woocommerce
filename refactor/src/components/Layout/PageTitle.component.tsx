interface IPageTitleProps {
  title: string;
  marginLeft?: boolean;
}

/**
 * Renders page title for each page.
 * @function PageTitle
 * @param {boolean} marginLeft - Adds extra margin left if true
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */
const PageTitle = ({ title, marginLeft }: IPageTitleProps) => (
  <section
    className={`container ${
      marginLeft ? 'pl-8' : 'pl-4'
    }  pl-4 mx-auto mt-32 text-center bg-white`}
  >
    <span className="py-2 text-2xl font-bold tracking-wide text-center text-gray-800 no-underline uppercase hover:no-underline">
      {title}
    </span>
  </section>
);

export default PageTitle;
