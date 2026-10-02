import { getCurrentProfile, createOrUpdateProfile } from '@/actions/profile';
import { NextResponse } from 'next/server';

export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await createOrUpdateProfile(body);
  return NextResponse.json(res);
}
