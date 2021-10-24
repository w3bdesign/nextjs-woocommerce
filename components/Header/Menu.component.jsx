import React from 'react';
import Link from 'next/link';

/**
 ** Implement mobile menu.
 */

const Menu = () => {
  return (
    <ul>
        <li className="w-full p-4 border-t border-gray-400 border-solid rounded">
            <Link href="/">
            <a
                className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                href="#"
            >
                Hjem
            </a>
            </Link>
        </li>
        <li className="w-full p-4 border-t border-gray-400 border-solid rounded">
            <Link href="/produkter">
            <a
                className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                href="#"
            >
                Produkter
            </a>
            </Link>
        </li>
        <li
            id="mobile-li"
            className="w-full p-4 border-t border-b border-gray-400 border-solid rounded"
        >
            <Link href="/kategorier">
            <a
                className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                href="#"
            >
                Kategorier
            </a>
            </Link>
        </li>
    </ul>
  );
}

export default Menu;
