import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '@/components/ui/card';
import { TypographyLarge } from '@/components/UI/Typography.component';

interface ICategoriesProps {
  categories: { id: string; name: string; slug: string }[];
}

const Categories = ({ categories }: ICategoriesProps) => (
  <section className="container mx-auto bg-white">
    <div className="grid gap-4 px-2 pt-2 pb-2 lg:px-0 xl:px-0 md:px-0 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-3 xs:grid-cols-3">
      {categories.map(({ id, name, slug }) => (
        <Link
          key={uuidv4()}
          href={`/category/${encodeURIComponent(slug)}?id=${encodeURIComponent(id)}`}
        >
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-full h-16 text-center">
              <TypographyLarge>{name}</TypographyLarge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  </section>
);

export default Categories;
