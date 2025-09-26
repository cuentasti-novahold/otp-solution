import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname === '/' || pathname === '') {
        return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    if (
        pathname.startsWith('/arnova') ||
        pathname.startsWith('/solvia') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    return NextResponse.rewrite(new URL('/not-found', request.url));
}
