// Protects routes, refreshes session (new)
import { NextResponse } from 'next/server';

// TODO: refresh the Supabase session and protect routes here
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};