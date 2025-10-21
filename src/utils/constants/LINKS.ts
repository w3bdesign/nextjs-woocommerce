interface ILinks {
  id: number;
  title: string;
  href: string;
}

const LINKS: ILinks[] = [
  {
    id: 0,
    title: 'Home',
    href: '/',
  },
  {
    id: 1,
    title: 'Products',
    href: '/products',
  },
  {
    id: 2,
    title: 'Categories',
    href: '/categories',
  },
];

export default LINKS;
