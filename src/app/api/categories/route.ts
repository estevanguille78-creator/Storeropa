import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image_url, banner_url, sort_order, is_active } = body;

    const safeSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const res = await query(
      `
      INSERT INTO categories (name, slug, description, image_url, banner_url, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        name,
        safeSlug,
        description || '',
        image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
        banner_url || null,
        sort_order || 0,
        is_active ?? true,
      ]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const err = error as { code?: string };
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una categoría con este slug/ruta' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}

