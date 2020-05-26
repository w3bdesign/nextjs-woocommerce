const SearchResults = ({ hit }) => {
  console.log(hit);
  return (
    <article className="hit">
      <div className="flex p-6 bg-white">
        <header className="hit-image-container">
          <img
            src={hit.images.thumbnail.url}
            alt={hit.name}
            className="w-12 hit-image"
          />
        </header>  

        <div className="pl-4 text-left">
          {hit.post_title && (
            <span class="text-lg  font-bold">{hit.post_title}</span>
          )}
          <br />
          {hit.content && <span class="text-base">{hit.content}</span>}
          <br />
          {hit.price && <span class="text-base">kr {hit.price}</span>}
        </div>
      </div>
    </article>
  );
};

export default SearchResults;
