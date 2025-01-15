import Image from 'next/image';
import Link from 'next/link';

/**
 * Renders Hero section for Index page
 * @function Hero
 * @returns {JSX.Element} - Rendered component
 */
const Hero = () => (
  <section className="relative w-full h-[60vh] overflow-hidden">
    <div className="absolute inset-0">
      <Image
        src="/images/hero.jpg"
        alt="Hero image"
        fill
        priority
        className="object-cover object-center"
        quality={90}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30" />
    </div>
    
    <div className="relative h-full container mx-auto flex items-center">
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
          Stripete Zig Zag Pute Sett
        </h1>
        <Link 
          href="/produkter"
          className="inline-block px-8 py-4 text-sm tracking-wider uppercase bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200"
        >
          Se Utvalget
        </Link>
      </div>
    </div>
  </section>
);

export default Hero;
