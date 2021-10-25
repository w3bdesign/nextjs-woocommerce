import React from 'react';

const MenuItem = (label = '', url = '/', id = '') => {
  return (
     <li
        id={id}
        className="w-full p-4 border-t border-b border-gray-400 border-solid rounded"
    >
        <Link href={url}>
        <a
            className="inline-block px-4 py-2 no-underline hover:text-black hover:underline"
            href="#"
        >
            {label}
        </a>
        </Link>
    </li>
  );
}

export default MenuItem;
