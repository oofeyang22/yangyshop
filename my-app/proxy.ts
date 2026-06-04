
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                       req.nextUrl.pathname.startsWith('/signup');


    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                           req.nextUrl.pathname.startsWith('/signup');
        if (isAuthPage) return true; 
        return !!token;              
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/login',
    '/signup',
  ],
};