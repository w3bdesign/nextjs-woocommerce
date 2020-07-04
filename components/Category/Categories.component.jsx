import { v4 as uuidv4 } from 'uuid';

/**
 * Map over the categories and display them individually.
 * Uses uuidv4 for unique key IDs
 * @param {Object} categories
 */
const Categories = ({ categories }) => {
 
  return (
    <>
    
      <section className="container mx-auto bg-white">
      
        <div className="flex ">
        
          {categories.map(({ name }) => (
            <div
              key={uuidv4()}
              className="flex flex-col justify-around p-6 cursor-pointer xs:w-1/2 md:w-1/3 xl:w-1/4"
            >
              <div className="flex items-center justify-center w-full h-16 text-center border border-gray-300 rounded-lg shadow hover:shadow-outline">
                <p className="text-lg">{name}</p>
               
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Categories;
