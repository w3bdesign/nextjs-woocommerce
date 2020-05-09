import fetch from 'node-fetch';

const url = 'http://localhost:3000';

function HomePage(props) {
  return (
    <div>
      {props.posts.map(({ id, name, price, images }) => (
        <div key={id}>
          ID: {id} <br /> Name: {name} <br /> Price: ${price} <br /> Image:{' '}
          <img src={images[0].src} />
          <hr />
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps(context) {
  const posts = await fetch(`${url}/api/hello`)
    .then((res) => res.json())
    .catch((error) => console.log(error));

  return {
    props: {
      posts,
    },
  };
}

export default HomePage;
