import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TypographyLarge } from '@/components/ui/Typography.component';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { hasCredentials } from '../../utils/auth';
import AlgoliaSearchBox from '../AlgoliaSearch/AlgoliaSearchBox.component';
import MobileSearch from '../AlgoliaSearch/MobileSearch.component';
import { Container } from '../Layout/Container.component';
import Cart from './Cart.component';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(hasCredentials());
  }, []);

  return (
    <header className="border-b border-gray-200">
      <nav id="header" className="top-0 z-50 w-full bg-white">
        <Container paddingClassName="px-4 sm:px-6 py-4">
          {/* Mobile Navigation */}
          <div className="flex items-center justify-between md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Main Navigation */}
                  {siteConfig.mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4" />

                  {/* Auth Navigation */}
                  {loggedIn ? (
                    <Link
                      href={siteConfig.authNav.account.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      {siteConfig.authNav.account.title}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={siteConfig.authNav.login.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium uppercase tracking-wider hover:text-gray-600 transition-colors"
                      >
                        {siteConfig.authNav.login.title}
                      </Link>
                      <Link
                        href={siteConfig.authNav.register.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium uppercase tracking-wider hover:text-gray-600 transition-colors"
                      >
                        {siteConfig.authNav.register.title}
                      </Link>
                    </>
                  )}

                  {/* Mobile Search */}
                  <div className="pt-4">
                    <MobileSearch />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex-1 text-center">
              <span className="text-lg font-bold tracking-widest text-gray-900">
                {siteConfig.name}
              </span>
            </Link>

            <Cart />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left: Main Navigation */}
            <NavigationMenu>
              <NavigationMenuList>
                {siteConfig.mainNav.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'uppercase tracking-wider text-sm',
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Center: Logo */}
            <Link href="/" className="hidden lg:block">
              <TypographyLarge className="tracking-widest hover:text-gray-700 transition-colors">
                {siteConfig.name}
              </TypographyLarge>
            </Link>

            {/* Right: Search, Auth, Cart */}
            <div className="flex items-center space-x-3">
              <AlgoliaSearchBox />

              <NavigationMenu>
                <NavigationMenuList>
                  {loggedIn ? (
                    <NavigationMenuItem>
                      <Link
                        href={siteConfig.authNav.account.href}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            'uppercase tracking-wider text-sm',
                          )}
                        >
                          {siteConfig.authNav.account.title}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ) : (
                    <>
                      <NavigationMenuItem>
                        <Link
                          href={siteConfig.authNav.login.href}
                          legacyBehavior
                          passHref
                        >
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              'uppercase tracking-wider text-sm',
                            )}
                          >
                            {siteConfig.authNav.login.title}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link
                          href={siteConfig.authNav.register.href}
                          legacyBehavior
                          passHref
                        >
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              'uppercase tracking-wider text-sm',
                            )}
                          >
                            {siteConfig.authNav.register.title}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                </NavigationMenuList>
              </NavigationMenu>

              <Cart />
            </div>
          </div>
        </Container>
      </nav>
    </header>
  );
};

export default Navbar;
