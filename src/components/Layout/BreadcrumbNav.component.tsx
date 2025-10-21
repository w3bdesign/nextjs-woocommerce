import Link from 'next/link';
import { Container } from './Container.component';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbNavItem {
  label: string;
  href?: string; // Undefined = current page (not clickable)
}

interface BreadcrumbNavProps {
  items: BreadcrumbNavItem[];
  className?: string;
}

/**
 * Reusable breadcrumb navigation component
 * Last item in array is treated as current page (not clickable)
 *
 * @example
 * <BreadcrumbNav
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Modern Chair' }
 *   ]}
 * />
 */
const BreadcrumbNav = ({ items, className }: BreadcrumbNavProps) => {
  if (!items || items.length === 0) return null;

  return (
    <Container paddingClassName="px-4 pt-4" className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div key={`${item.label}-${index}`} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}

                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
};

export default BreadcrumbNav;
