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
        alt="Stripete Zig Zag puter i varme farger, arrangert på en sofa"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        quality={90}
      />
      <div className="absolute inset-0 bg-overlay bg-opacity-30" />
    </div>
    
    <div className="relative h-full container mx-auto flex items-center p-4 md:px-6">
      <div className="max-w-xl rounded-lg bg-overlay/50 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-light text-white mb-6">
          Stripete Zig Zag Pute Sett
        </h1>
        <Button
          href="/produkter"
          variant="hero"
        >
          Se Utvalget
        </Button>
      </div>
    </div>
  </section>
);

export default Hero;
