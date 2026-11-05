import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const res = await query(
      `
      SELECT o.*, p.title as payment_method_title, p.details as payment_method_details
      FROM orders o
      LEFT JOIN payment_methods p ON o.payment_method_id = p.id
      WHERE o.id = $1
      LIMIT 1
      `,
      [params.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    const res = await query(
      `
      UPDATE orders
      SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes)
      WHERE id = $3
      RETURNING *;
      `,
      [status, notes, params.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

