//const axios = require('axios').default;
import fetch from 'node-fetch';

const url = 'http://localhost:3000';

function HomePage(props) {
  console.log('Props from Homepage: ');
  console.log(props);
  return <div>Welcome to Next.js! Reply from </div>;
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
