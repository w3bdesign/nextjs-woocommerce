import Link from 'next/link';

interface ICategoriesProps {
  categories: { id: string; name: string; slug: string }[];
}

const Categories = ({ categories }: ICategoriesProps) => (
  <section className="container mx-auto bg-surface">
    <div className="grid gap-2 px-2 pt-2 pb-2 lg:px-0 xl:px-0 md:px-0 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-3 xs:grid-cols-3">
      {categories.map(({ id, name, slug }) => (
        <Link
          key={id}
          href={`/kategori/${encodeURIComponent(slug)}?id=${encodeURIComponent(id)}`}
        >
          <div className="p-6 cursor-pointer">
            <div className="flex items-center justify-center w-full h-16 text-center border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary transition-all duration-200">
              <p className="text-lg text-text">{name}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default Categories;
