import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { name, slug, description, image_url, banner_url, sort_order, is_active } = body;

    const res = await query(
      `
      UPDATE categories
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        banner_url = COALESCE($5, banner_url),
        sort_order = COALESCE($6, sort_order),
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *;
      `,
      [name, slug, description, image_url, banner_url, sort_order, is_active, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}

