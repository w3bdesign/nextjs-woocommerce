import { Highlight } from 'react-instantsearch-dom';

const SearchResults = ({ hit }) => {
  return (
    <article className="hit">
      <div className="flex p-6 bg-white">
        <header className="hit-image-container">
          <img
            src={hit.images.thumbnail.url}
            alt={hit.name}
            className="hit-image"
          />
        </header>
        <h1 className="pl-4 text-lg font-bold">
          <Highlight attribute="post_title" hit={hit} />
        </h1>
      </div>
    </article>
  );
};

export default SearchResults;
