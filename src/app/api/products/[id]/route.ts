import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const isNumeric = /^\d+$/.test(params.id);
    let res;

    if (isNumeric) {
      res = await query(
        `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
        LIMIT 1
      `,
        [parseInt(params.id, 10)]
      );
    } else {
      res = await query(
        `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1
        LIMIT 1
      `,
        [params.id]
      );
    }

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const {
      name,
      slug,
      description,
      category_id,
      price,
      reseller_price,
      compare_at_price,
      images,
      badge,
      is_featured,
      is_active,
      stock,
      attributes,
    } = body;

    const res = await query(
      `
      UPDATE products
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        category_id = COALESCE($4, category_id),
        price = COALESCE($5, price),
        reseller_price = $6,
        compare_at_price = $7,
        images = COALESCE($8::jsonb, images),
        badge = $9,
        is_featured = COALESCE($10, is_featured),
        is_active = COALESCE($11, is_active),
        stock = COALESCE($12, stock),
        attributes = COALESCE($13::jsonb, attributes)
      WHERE id = $14
      RETURNING *;
      `,
      [
        name,
        slug,
        description,
        category_id,
        price,
        reseller_price,
        compare_at_price,
        images ? JSON.stringify(images) : null,
        badge,
        is_featured,
        is_active,
        stock,
        attributes ? JSON.stringify(attributes) : null,
        id,
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}

