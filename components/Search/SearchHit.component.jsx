import { Highlight } from 'react-instantsearch-dom';

const SearchHit = (props) => {
  return (
    <article>
      <h1>
        <Highlight attribute="post_title" hit={props.hit} />
      </h1>
    </article>
  );
};

export default SearchHit;
