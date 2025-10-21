import { TypographyH2 } from '@/components/UI/Typography.component';

interface IPageTitleProps {
  title: string;
}

/**
 * Renders page title for each page.
 * @function PageTitle
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */
const PageTitle = ({ title }: IPageTitleProps) => (
  <section className="w-full bg-white border-b border-gray-200">
    <div className="container mx-auto py-12 px-6">
      <TypographyH2 className="text-center tracking-wider uppercase">
        {title}
      </TypographyH2>
    </div>
  </section>
);

export default PageTitle;
