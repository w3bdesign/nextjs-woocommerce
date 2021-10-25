import React from 'react';
import Link from 'next/link';
import MenuItem from './MenuItem.component';

/**
 ** Implement mobile menu.
 */

const Menu = () => (
    <ul>
        <MenuItem label="Hjem" />
        <MenuItem label="Produkter" url="/produkter" />
        <MenuItem label="Kategorier" url="/kategorier" id="mobile-li" />
    </ul>
);

export default Menu;
