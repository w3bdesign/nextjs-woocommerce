import Image from 'next/image';
import Button from '../UI/Button.component';

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
    
    <div className="relative h-full container mx-auto flex items-center p-4 md:p-0">
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
          Stripete Zig Zag Pute Sett
        </h1>
        <Button 
          href="/produkter"
          isHero
        >
          Se Utvalget
        </Button>
      </div>
    </div>
  </section>
);

export default Hero;
