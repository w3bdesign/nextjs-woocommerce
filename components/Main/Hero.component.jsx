function Hero() {
  // style={{max-width:1600px; height: 32rem; background-image: url('https://images.unsplash.com/photo-1422190441165-ec2956dc9ecc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1600&q=80')}}
  return (
    <>
      <section
        id="hero"
        className="flex w-full pt-12 mx-auto mt-12 bg-right bg-cover md:pt-0 md:items-center"
      >
        <div className="container mx-auto">
          <div className="flex flex-col items-start justify-center w-full px-6 tracking-wide lg:w-1/2">
            <h1 className="my-4 text-2xl text-black">
              Stripete Zig Zag Jigsaw Pute Sett
            </h1>

            <a
              className="inline-block px-6 py-3 text-xl leading-relaxed border border-gray-600 border-solid"
              href="#"
            >
              Kjøp Nå
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
