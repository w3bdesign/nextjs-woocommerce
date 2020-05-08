import fetch from 'node-fetch';

const url = 'http://localhost:3000';

function HomePage({posts}) {
    //const myArray = Object.entries(posts);
  console.log('Props from Homepage: ');
  console.log(posts);
  return (
<div>
    Test
    <br/>

    {
    //console.log(Object.entries(posts))
    posts.map(({
        text
      }) => <div key="1">Data fra data: {text} </div>)
    //props.posts.map(data => <div>{data}</div>)
    }

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
