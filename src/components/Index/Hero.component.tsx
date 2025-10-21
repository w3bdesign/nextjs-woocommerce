import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TypographyH1 } from '@/components/UI/Typography.component';

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
      />
      <div className="absolute inset-0 bg-black bg-opacity-30" />
    </div>
    
    <div className="relative h-full container mx-auto flex items-center p-4 md:p-0">
      <div className="max-w-xl">
        <TypographyH1 className="font-light text-white mb-6">
          Premium Furniture Collection
        </TypographyH1>
        <Button 
          variant="hero"
          asChild
        >
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default Hero;
