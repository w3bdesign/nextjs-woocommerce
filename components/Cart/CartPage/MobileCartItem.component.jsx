import { useState } from 'react';

import SVGX from 'components/SVG/SVGX.component';

const MobileCartItem = ({ item }) => {
  const [productCount, setProductCount] = useState(item.qty);

  return (
    <>
      <div className="inline-block pt-2">
        <SVGX />
      </div>

      <div className="inline-block pt-2">
        {item.name}
        
      </div>

      <div className="inline-block pt-2">
        {'string' !== typeof item.price ? item.price.toFixed(2) : item.price}
      
      </div>

      <div className="inline-block pt-2">
        <input className="w-12" type="number" min="1" value={productCount} />
      
      </div>

      <div className="inline-block pt-2">
        {'string' !== typeof item.totalPrice
          ? item.totalPrice.toFixed(2)
          : item.totalPrice}
       
      </div>
    </>
  );
};

export default MobileCartItem;
