import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const res = await query(
      'SELECT id, name, email, role, phone, country, age FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email.trim()]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
