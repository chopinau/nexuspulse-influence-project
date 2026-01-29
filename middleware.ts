import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default withAuth(
  function middleware(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Remove locale prefix to check the actual path
        // e.g. /en/dashboard -> /dashboard
        const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

        // Strict protection for these paths
        const protectedPaths = ['/dashboard', '/account'];
        
        const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p));

        if (isProtected) {
          return token !== null;
        }
        
        // Public paths are always allowed
        return true;
      },
    },
    pages: {
      signIn: '/api/auth/signin',
    },
  }
);

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - intel (intelligence reports)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|intel).*)']
};
