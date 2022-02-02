/**
 * Initial hero content displayed on the front page, under the navigation bar.
 */
const Hero = () => (
  <section
    id="hero"
    className="flex w-full pt-10 mx-auto bg-right bg-cover mt-36 md:pt-0 md:items-center"
  >
    <div className="container mx-auto">
      <div className="flex flex-col items-start justify-center w-full px-6 tracking-wide lg:w-1/2">
        <h1 className="p-4 my-4 text-2xl text-white bg-black rounded-lg">
          Stripete Zig Zag Pute Sett
        </h1>

        <a
          className="inline-block px-6 py-3 text-xl leading-relaxed text-white uppercase bg-black rounded-lg hover:underline"
          href="#"
        >
          se utvalget
        </a>
      </div>
    </div>
  </section>
);

export default Hero;
