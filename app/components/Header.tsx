import {Await, NavLink} from '@remix-run/react';
import {Suspense} from 'react';
import {CiShoppingCart, CiSearch, CiUser, CiMenuBurger} from 'react-icons/ci';
import type {HeaderQuery} from 'storefrontapi.generated';
import type {LayoutProps} from './Layout';
import {useRootLoaderData} from '~/root';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <NavLink
        className="mr-4"
        prefetch="intent"
        to="/"
        style={activeLinkStyle}
        end
      >
        <strong>{shop.name}</strong>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `header-menu-${viewport}`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  // these classes let us reuse the same component with diff. styles in mobile & desktop
  // while also totally hiding the component in mobile view outside of the aside element
  const navClassName =
    viewport === 'mobile'
      ? 'flex flex-col'
      : 'flex flex-row justify-between gap-4';
  const navLinkClassName = viewport === 'mobile' ? 'block' : 'hidden md:block';

  return (
    <nav className={navClassName} role="navigation">
      <NavLink
        className={navLinkClassName}
        end
        onClick={closeAside}
        prefetch="intent"
        style={activeLinkStyle}
        to="/"
      >
        Home
      </NavLink>

      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className={navLinkClassName}
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <CiUser className="h-5 w-5 hover:fill-pink-400" />
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
      <HeaderMenuMobileToggle />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="md:hidden" href="#mobile-menu-aside">
      <CiMenuBurger className="h-5 w-5 hover:fill-pink-400" />
    </a>
  );
}

function SearchToggle() {
  return (
    <a href="#search-aside">
      <CiSearch className="h-5 w-5 hover:fill-pink-400" />
    </a>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <a href="#cart-aside">
      <CiShoppingCart className="h-5 w-5 hover:fill-pink-400" />
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
