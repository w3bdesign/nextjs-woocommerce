import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface ICategoriesProps {
  categories: { id: string; name: string; slug: string }[];
}

const Categories = ({ categories }: ICategoriesProps) => (
  <section className="container mx-auto bg-white">
    <div className="grid gap-2 px-2 pt-2 pb-2 lg:px-0 xl:px-0 md:px-0 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 xs:grid-cols-3">
      {categories.map(({ id, name, slug }) => (
        <Link
          key={uuidv4()}
          as={`/kategori/${slug}?id=${id}`}
          href="/kategori/[id]"
          passHref
        >
          <div className="p-6 cursor-pointer">
            <div className="flex items-center justify-center w-full h-16 text-center border border-gray-300 rounded-lg shadow hover:shadow-outline">
              <p className="text-lg">{name}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default Categories;
