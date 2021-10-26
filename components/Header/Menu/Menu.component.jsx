import React from 'react';
import MenuItem from './MenuItem.component';

/**
 ** Menu wrapper
 */

const Menu = () => {
    return (
        <ul>
            <MenuItem label="Hjem" />
            <MenuItem label="Produkter" url="/produkter" />
            <MenuItem label="Kategorier" url="/kategorier" id="mobile-li" />
        </ul>
    );
};

export default Menu;
