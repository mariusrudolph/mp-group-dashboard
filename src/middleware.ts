import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Prüfe, ob der User bereits authentifiziert ist
    const isAuthenticated = request.cookies.get('auth-token')?.value === 'authenticated'

    // Wenn nicht authentifiziert und nicht auf der Login-Seite
    if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
        // Redirect zur Login-Seite
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Wenn authentifiziert und auf der Login-Seite, redirect zum Dashboard
    if (isAuthenticated && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
